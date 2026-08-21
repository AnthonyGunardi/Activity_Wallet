import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as XLSX from 'xlsx';
import { BulkImportModal } from '../../src/components/admin/BulkImportModal';
import * as excelHelperModule from '../../src/utils/excelHelper';

describe('BulkImportModal Component Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should render Excel import title, dropzone, and template download button', () => {
    render(
      <BulkImportModal
        isOpen={true}
        isSubmitting={false}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Impor Data Peserta (Excel / .xlsx)')).toBeInTheDocument();
    expect(screen.getByText(/Download Template/i)).toBeInTheDocument();
    expect(screen.getByText(/Klik atau drag file Excel ke sini/i)).toBeInTheDocument();
  });

  it('should trigger template download when download button is clicked', () => {
    const templateSpy = vi.spyOn(excelHelperModule, 'generateParticipantTemplate').mockImplementation(() => { });

    render(
      <BulkImportModal
        isOpen={true}
        isSubmitting={false}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />
    );

    const downloadBtn = screen.getByRole('button', { name: /Download Template/i });
    fireEvent.click(downloadBtn);

    expect(templateSpy).toHaveBeenCalled();
  });

  it('should display error if uploaded file has invalid extension', async () => {
    render(
      <BulkImportModal
        isOpen={true}
        isSubmitting={false}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />
    );

    const fileInput = screen.getByLabelText('Upload File Excel');
    const invalidFile = new File(['dummy content'], 'participants.csv', { type: 'text/csv' });

    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    expect(await screen.findByText(/Format file tidak didukung/i)).toBeInTheDocument();
  });

  it('should parse valid Excel file, display preview table, and trigger onSubmit', async () => {
    const handleSubmit = vi.fn();
    const mockData = [
      ['Nama Peserta', 'Saldo Awal (Rp)', 'Kode QR (Opsional)'],
      ['Siti Rahma', 1000000, 'SEPA-SITI'],
      ['Joko Anwar', 1000000, '']
    ];
    const ws = XLSX.utils.aoa_to_sheet(mockData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Peserta');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    const file = new File([excelBuffer], 'peserta.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    render(
      <BulkImportModal
        isOpen={true}
        isSubmitting={false}
        onSubmit={handleSubmit}
        onClose={vi.fn()}
      />
    );

    const fileInput = screen.getByLabelText('Upload File Excel');
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Siti Rahma')).toBeInTheDocument();
      expect(screen.getByText('Joko Anwar')).toBeInTheDocument();
      expect(screen.getByText(/Pratinjau Data \(2 Peserta\)/i)).toBeInTheDocument();
    });

    const submitBtn = screen.getByRole('button', { name: /Import 2 Peserta/i });
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledWith([
      { name: 'Siti Rahma', initial_credit: 1000000, qr_code: 'SEPA-SITI' },
      { name: 'Joko Anwar', initial_credit: 1000000 }
    ]);
  });
});
