import * as XLSX from 'xlsx';

/**
 * Normalizes an object key to lowercase alphanumeric without whitespace.
 *
 * @param {string} key
 * @returns {string}
 */
function normalizeKey(key) {
  return String(key || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Finds a matching column value from a row using flexible header synonyms.
 *
 * @param {Object} row - Sheet row object
 * @param {string[]} synonyms - Normalized key synonyms to check
 * @returns {any}
 */
function findValue(row, synonyms) {
  const keys = Object.keys(row);
  for (const key of keys) {
    const norm = normalizeKey(key);
    if (synonyms.includes(norm)) {
      return row[key];
    }
  }
  return undefined;
}

/**
 * Parses an Excel (.xlsx / .xls) file and extracts participant records.
 * Supports flexible column header naming (e.g., 'Nama Peserta', 'Saldo Awal', 'Kode QR').
 *
 * @param {File|Blob|ArrayBuffer} fileInput - Uploaded file or buffer
 * @returns {Promise<{
 *   participants: Array<{ name: string, initial_credit: number, qr_code?: string }>,
 *   errors: string[],
 *   totalRows: number
 * }>}
 */
export async function parseParticipantExcel(fileInput) {
  let arrayBuffer;
  if (fileInput instanceof ArrayBuffer) {
    arrayBuffer = fileInput;
  } else if (fileInput && typeof fileInput.arrayBuffer === 'function') {
    arrayBuffer = await fileInput.arrayBuffer();
  } else if (fileInput && typeof FileReader !== 'undefined') {
    arrayBuffer = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Gagal membaca file dengan FileReader.'));
      reader.readAsArrayBuffer(fileInput);
    });
  } else {
    throw new Error('Format file tidak valid untuk dibaca.');
  }

  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('File Excel tidak memiliki lembar kerja (worksheet).');
  }

  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  const participants = [];
  const errors = [];

  const nameSynonyms = ['namapeserta', 'nama', 'name', 'participantname', 'namalengkap'];
  const creditSynonyms = ['saldoawal', 'saldoawalrp', 'saldo', 'initialcredit', 'credit', 'kredit'];
  const qrSynonyms = ['kodeqr', 'kodeqropsional', 'qrcode', 'qr', 'token', 'wristbandid'];

  rows.forEach((row, index) => {
    const rawName = findValue(row, nameSynonyms);
    const rawCredit = findValue(row, creditSynonyms);
    const rawQr = findValue(row, qrSynonyms);

    const name = typeof rawName === 'string' ? rawName.trim() : String(rawName || '').trim();
    if (!name) {
      // Row is empty or missing name
      if (Object.values(row).some((v) => String(v).trim().length > 0)) {
        errors.push(`Baris ${index + 2}: Nama peserta tidak boleh kosong.`);
      }
      return;
    }

    let initialCredit = 1000000;
    if (rawCredit !== undefined && rawCredit !== null && String(rawCredit).trim() !== '') {
      const cleanStr = String(rawCredit).replace(/[^0-9.-]+/g, '');
      if (cleanStr !== '') {
        const parsedNum = Number(cleanStr);
        if (!isNaN(parsedNum) && parsedNum >= 0) {
          initialCredit = Math.floor(parsedNum);
        }
      }
    }

    const participant = {
      name,
      initial_credit: initialCredit
    };

    const qrCode = typeof rawQr === 'string' ? rawQr.trim() : String(rawQr || '').trim();
    if (qrCode) {
      participant.qr_code = qrCode;
    }

    participants.push(participant);
  });

  return {
    participants,
    errors,
    totalRows: rows.length
  };
}

/**
 * Generates and downloads the standard participant import Excel template (.xlsx).
 *
 * @param {string} [filename='Template_Import_Peserta.xlsx']
 */
export function generateParticipantTemplate(filename = 'Template_Import_Peserta.xlsx') {
  const wb = XLSX.utils.book_new();

  const data = [
    ['Nama Peserta', 'Saldo Awal (Rp)', 'Kode QR (Opsional)'],
    ['Ahmad Fauzi', 1000000, ''],
    ['Budi Santoso', 1000000, ''],
    ['Citra Lestari', 1000000, ''],
    ['Dedi Pratama', 1000000, '']
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths for user clarity
  ws['!cols'] = [
    { wch: 25 },
    { wch: 18 },
    { wch: 22 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Daftar Peserta');

  // Generate buffer and trigger browser download
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
