import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as XLSX from 'xlsx';
import { parseParticipantExcel, generateParticipantTemplate } from '../../src/utils/excelHelper';

describe('excelHelper Unit Tests', () => {
  describe('parseParticipantExcel', () => {
    it('should throw error when input is invalid or not ArrayBuffer', async () => {
      await expect(parseParticipantExcel(null)).rejects.toThrow('Format file tidak valid untuk dibaca.');
    });

    it('should parse valid Excel buffer with standard column names', async () => {
      const data = [
        ['Nama Peserta', 'Saldo Awal (Rp)', 'Kode QR (Opsional)'],
        ['Ahmad Fauzi', 1000000, 'SEPA-CUSTOM-01'],
        ['Budi Santoso', 500000, '']
      ];
      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

      const result = await parseParticipantExcel(buffer);
      expect(result.participants).toHaveLength(2);
      expect(result.participants[0]).toEqual({
        name: 'Ahmad Fauzi',
        initial_credit: 1000000,
        qr_code: 'SEPA-CUSTOM-01'
      });
      expect(result.participants[1]).toEqual({
        name: 'Budi Santoso',
        initial_credit: 500000
      });
      expect(result.errors).toHaveLength(0);
    });

    it('should handle alternative header names and default credit to 1000000', async () => {
      const data = [
        ['name', 'Credit', 'qr_code'],
        ['Citra Lestari', '', ''],
        ['Dedi Pratama', 'invalid_credit', 'QR-DEDI']
      ];
      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

      const result = await parseParticipantExcel(buffer);
      expect(result.participants).toHaveLength(2);
      expect(result.participants[0]).toEqual({
        name: 'Citra Lestari',
        initial_credit: 1000000
      });
      expect(result.participants[1]).toEqual({
        name: 'Dedi Pratama',
        initial_credit: 1000000,
        qr_code: 'QR-DEDI'
      });
    });

    it('should collect errors for rows missing name but having other data', async () => {
      const data = [
        ['Nama Peserta', 'Saldo Awal'],
        ['', 1000000],
        ['Eka Putri', 1000000]
      ];
      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

      const result = await parseParticipantExcel(buffer);
      expect(result.participants).toHaveLength(1);
      expect(result.participants[0].name).toBe('Eka Putri');
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Nama peserta tidak boleh kosong');
    });

    it('should parse Blob/File object having arrayBuffer method', async () => {
      const data = [
        ['Nama', 'Saldo'],
        ['Fajar Nugraha', 750000]
      ];
      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

      const mockFile = {
        arrayBuffer: async () => buffer
      };

      const result = await parseParticipantExcel(mockFile);
      expect(result.participants).toHaveLength(1);
      expect(result.participants[0]).toEqual({
        name: 'Fajar Nugraha',
        initial_credit: 750000
      });
    });
  });

  describe('generateParticipantTemplate', () => {
    let originalCreateObjectURL;
    let originalRevokeObjectURL;

    beforeEach(() => {
      originalCreateObjectURL = window.URL.createObjectURL;
      originalRevokeObjectURL = window.URL.revokeObjectURL;
      window.URL.createObjectURL = vi.fn(() => 'blob:http://localhost/template-excel');
      window.URL.revokeObjectURL = vi.fn();
    });

    afterEach(() => {
      window.URL.createObjectURL = originalCreateObjectURL;
      window.URL.revokeObjectURL = originalRevokeObjectURL;
      vi.restoreAllMocks();
    });

    it('should create and trigger download of template xlsx file', () => {
      const appendChildSpy = vi.spyOn(document.body, 'appendChild');
      const removeChildSpy = vi.spyOn(document.body, 'removeChild');

      generateParticipantTemplate('Custom_Template.xlsx');

      expect(window.URL.createObjectURL).toHaveBeenCalled();
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
      expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/template-excel');
    });
  });
});
