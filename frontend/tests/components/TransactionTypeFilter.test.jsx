import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TransactionTypeFilter } from '../../src/components/admin/TransactionTypeFilter';

describe('TransactionTypeFilter Component Tests', () => {
  it('renders default state with "Semua Jenis Transaksi"', () => {
    const handleChange = vi.fn();
    render(<TransactionTypeFilter value="" onChange={handleChange} />);

    expect(screen.getByRole('button', { name: /pilih jenis transaksi/i })).toHaveTextContent(
      'Semua Jenis Transaksi'
    );
    expect(screen.getByRole('combobox')).toHaveValue('');
  });

  it('renders selected value label and active styling when value is DEDUCTION', () => {
    render(<TransactionTypeFilter value="DEDUCTION" onChange={vi.fn()} />);

    const trigger = screen.getByRole('button', { name: /pilih jenis transaksi/i });
    expect(trigger).toHaveTextContent('DEDUCTION (Pemotongan)');
    expect(trigger).toHaveClass('has-active-filter');
    expect(screen.getByRole('combobox')).toHaveValue('DEDUCTION');
  });

  it('opens floating popover menu on trigger click and displays options with badges', () => {
    render(<TransactionTypeFilter value="" onChange={vi.fn()} />);

    const trigger = screen.getByRole('button', { name: /pilih jenis transaksi/i });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    fireEvent.click(trigger);

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('Pilih Jenis Transaksi')).toBeInTheDocument();
    expect(screen.getByText('Pemotongan')).toBeInTheDocument();
    expect(screen.getByText('Pengembalian')).toBeInTheDocument();
    expect(screen.getByText('Semua riwayat debit & kredit')).toBeInTheDocument();
  });

  it('calls onChange with standard event payload when option is clicked', () => {
    const handleChange = vi.fn();
    render(<TransactionTypeFilter value="" onChange={handleChange} />);

    fireEvent.click(screen.getByRole('button', { name: /pilih jenis transaksi/i }));

    const deductionOption = screen.getByText('DEDUCTION');
    fireEvent.click(deductionOption);

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith({
      target: { value: 'DEDUCTION' }
    });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes popover on Escape key press', () => {
    render(<TransactionTypeFilter value="" onChange={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /pilih jenis transaksi/i }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('supports direct interaction with combobox role for automated tests', () => {
    function ControlledHarness() {
      const [val, setVal] = useState('');
      return <TransactionTypeFilter value={val} onChange={(e) => setVal(e.target.value)} />;
    }
    render(<ControlledHarness />);

    const combobox = screen.getByRole('combobox');
    fireEvent.change(combobox, { target: { value: 'REFUND' } });

    expect(combobox.value).toBe('REFUND');
    expect(screen.getByRole('button', { name: /pilih jenis transaksi/i })).toHaveTextContent(
      'REFUND (Pengembalian)'
    );
  });
});
