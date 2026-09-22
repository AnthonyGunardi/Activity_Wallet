import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ActivityRecapSection } from '../../src/components/admin/ActivityRecapSection';

describe('ActivityRecapSection Component Tests', () => {
  const sampleActivities = [
    {
      id: 'act-jetski',
      name: 'Jetski',
      price: 650000,
      status: 'ACTIVE',
      deduction_count: 12,
      refund_count: 1,
      gross_amount: 7800000,
      refund_amount: 650000,
      net_amount: 7150000,
      unique_participants_count: 11,
      share_percentage: 60
    },
    {
      id: 'act-banana',
      name: 'Banana Boat',
      price: 150000,
      status: 'INACTIVE',
      deduction_count: 4,
      refund_count: 0,
      gross_amount: 600000,
      refund_amount: 0,
      net_amount: 600000,
      unique_participants_count: 4,
      share_percentage: 40
    }
  ];

  const sampleSummary = {
    total_activities: 2,
    total_deductions: 16,
    total_refunds: 1,
    total_gross_amount: 8400000,
    total_refund_amount: 650000,
    total_net_amount: 7750000,
    total_unique_participants: 14
  };

  const renderComponent = (props = {}) => {
    return render(
      <MemoryRouter>
        <ActivityRecapSection
          activities={sampleActivities}
          summary={sampleSummary}
          isLoading={false}
          {...props}
        />
      </MemoryRouter>
    );
  };

  it('renders section title and wahana cards with metrics', () => {
    renderComponent();

    expect(screen.getByText('Rekapitulasi per Wahana')).toBeInTheDocument();
    expect(screen.getByText('Jetski')).toBeInTheDocument();
    expect(screen.getByText('Banana Boat')).toBeInTheDocument();
    expect(screen.getByText('Rp 650.000')).toBeInTheDocument();
    expect(screen.getByText('12x')).toBeInTheDocument();
    expect(screen.getByText('Rp 7.150.000')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText('Aktif')).toBeInTheDocument();
    expect(screen.getByText('Nonaktif')).toBeInTheDocument();
  });

  it('calls onFilterLedger when Filter Ledger button is clicked', () => {
    const onFilterLedger = vi.fn();
    renderComponent({ onFilterLedger });

    const filterButtons = screen.getAllByRole('button', { name: /filter ledger/i });
    fireEvent.click(filterButtons[0]);

    expect(onFilterLedger).toHaveBeenCalledWith('act-jetski', 'Jetski');
  });

  it('shows active state and triggers onClearFilter when already active', () => {
    const onClearFilter = vi.fn();
    renderComponent({ activeFilterId: 'act-jetski', onClearFilter });

    expect(screen.getByText(/sedang difilter/i)).toBeInTheDocument();
    expect(screen.getByText(/reset filter wahana/i)).toBeInTheDocument();

    const activeBtn = screen.getByRole('button', { name: /sedang difilter/i });
    fireEvent.click(activeBtn);
    expect(onClearFilter).toHaveBeenCalled();

    const resetBtn = screen.getByRole('button', { name: /reset filter wahana/i });
    fireEvent.click(resetBtn);
    expect(onClearFilter).toHaveBeenCalledTimes(2);
  });

  it('displays loading state properly', () => {
    renderComponent({ isLoading: true });
    expect(screen.getByText(/memuat rekapitulasi per wahana/i)).toBeInTheDocument();
  });

  it('displays empty state when activities array is empty', () => {
    renderComponent({ activities: [] });
    expect(screen.getByText(/belum ada data aktivitas terdaftar/i)).toBeInTheDocument();
  });
});
