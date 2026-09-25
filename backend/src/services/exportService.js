const { Op } = require('sequelize');
const { Participant, Transaction, Activity, User } = require('../models');

/**
 * Escapes a single cell value for CSV output following RFC 4180 standards
 * and mitigates formula injection risks (CSV injection / DDE attacks).
 *
 * @param {*} value - Any primitive value or object to format
 * @returns {string} - Safely escaped CSV string token
 */
function escapeCsvValue(value) {
  if (value === null || value === undefined) {
    return '""';
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  let str = String(value);

  // Neutralize formula injection prefixes if cell begins with =, +, -, @, \t, \r
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'\t${str}`;
  }

  // Escape double quotes by doubling them
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return `"${str}"`;
}

/**
 * Encodes special characters into valid XML entities for SpreadsheetML.
 *
 * @param {*} val - Cell value
 * @returns {string} - XML entity escaped string
 */
function escapeXml(val) {
  if (val === null || val === undefined) return '';
  return String(val)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Builds standard RFC 4180 CSV string with UTF-8 BOM prefix for Microsoft Excel compatibility.
 *
 * @param {Array<string>} headers - Column titles
 * @param {Array<Array<*>>} rows - Matrix of cell values
 * @returns {string} - UTF-8 CSV content
 */
function buildCsv(headers, rows) {
  const headerLine = headers.map((h) => (h.includes(',') || h.includes('"') ? `"${h.replace(/"/g, '""')}"` : h)).join(',');
  const rowLines = rows.map((row) => row.map(escapeCsvValue).join(','));
  return `\uFEFF${[headerLine, ...rowLines].join('\r\n')}`;
}

/**
 * Builds a Microsoft Excel 2003 XML Spreadsheet (SpreadsheetML) document.
 * This guarantees proper data typing (strings vs numeric currency values) in Excel.
 *
 * @param {string} sheetName - Worksheet title
 * @param {Array<string>} headers - Column titles
 * @param {Array<Array<*>>} rows - Matrix of cell values
 * @returns {string} - XML Spreadsheet string
 */
function buildXmlSpreadsheet(sheetName, headers, rows) {
  const safeSheetName = escapeXml(sheetName || 'Report');

  const headerCells = headers
    .map((h) => `<Cell><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`)
    .join('');

  const rowBlocks = rows
    .map((row) => {
      const cells = row
        .map((cell) => {
          if (typeof cell === 'number') {
            return `<Cell><Data ss:Type="Number">${cell}</Data></Cell>`;
          }
          return `<Cell><Data ss:Type="String">${escapeXml(cell)}</Data></Cell>`;
        })
        .join('');
      return `<Row>${cells}</Row>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:html="http://www.w3.org/TR/REC-html40">
  <Worksheet ss:Name="${safeSheetName}">
    <Table>
      <Row>${headerCells}</Row>
      ${rowBlocks}
    </Table>
  </Worksheet>
</Workbook>`;
}

/**
 * Generates a full export file containing participant balances, initial credit,
 * spent credit, and current status formatted as CSV or Excel Spreadsheet XML.
 *
 * @param {Object} query
 * @param {string} [query.format='csv'] - Output format ('csv', 'excel', 'xlsx', 'xls')
 * @param {string} [query.search] - Optional search filter for participant name/QR
 * @param {string} [query.status] - Optional status filter (ACTIVE / BLOCKED)
 * @returns {Promise<{ data: string, contentType: string, filename: string }>}
 */
async function generateParticipantsExport({ format = 'csv', search, status } = {}) {
  const where = {};

  if (status) {
    where.status = status;
  }

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    where[Op.or] = [
      { name: { [Op.like]: term } },
      { qr_code: { [Op.like]: term } }
    ];
  }

  const participants = await Participant.findAll({
    where,
    order: [['created_at', 'DESC']],
    raw: true
  });

  const headers = [
    'ID',
    'Nama Peserta',
    'QR Code / Token',
    'Saldo Awal (Rp)',
    'Total Pengeluaran (Rp)',
    'Sisa Saldo (Rp)',
    'Status',
    'Tanggal Terdaftar'
  ];

  const rows = participants.map((p) => [
    p.id,
    p.name,
    p.qr_code,
    p.initial_credit,
    p.total_spent,
    p.current_balance,
    p.status,
    p.created_at ? new Date(p.created_at).toISOString() : ''
  ]);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const isExcel = ['excel', 'xlsx', 'xls'].includes(format.toLowerCase());

  if (isExcel) {
    return {
      data: buildXmlSpreadsheet('Participants', headers, rows),
      contentType: 'application/vnd.ms-excel; charset=utf-8',
      filename: `participants-report-${timestamp}.xls`
    };
  }

  return {
    data: buildCsv(headers, rows),
    contentType: 'text/csv; charset=utf-8',
    filename: `participants-report-${timestamp}.csv`
  };
}

/**
 * Generates an immutable transaction audit ledger export file containing all deduction,
 * refund, and adjustment history with staff and activity references.
 *
 * @param {Object} query
 * @param {string} [query.format='csv'] - Output format ('csv', 'excel', 'xlsx', 'xls')
 * @param {string} [query.participant_id] - Filter by participant UUID
 * @param {string} [query.activity_id] - Filter by activity UUID
 * @param {string} [query.staff_id] - Filter by staff UUID
 * @param {string} [query.type] - Filter by transaction type
 * @param {string} [query.start_date] - Filter by start date
 * @param {string} [query.end_date] - Filter by end date
 * @param {string} [query.search] - Search participant name or QR
 * @returns {Promise<{ data: string, contentType: string, filename: string }>}
 */
async function generateTransactionsExport({
  format = 'csv',
  participant_id,
  activity_id,
  staff_id,
  type,
  start_date,
  end_date,
  search
} = {}) {
  const where = {};

  if (participant_id) where.participant_id = participant_id;
  if (activity_id) where.activity_id = activity_id;
  if (staff_id) where.staff_id = staff_id;
  if (type) where.type = type;

  if (start_date || end_date) {
    where.created_at = {};
    if (start_date) where.created_at[Op.gte] = new Date(start_date);
    if (end_date) where.created_at[Op.lte] = new Date(end_date);
  }

  const participantWhere = {};
  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    participantWhere[Op.or] = [
      { name: { [Op.like]: term } },
      { qr_code: { [Op.like]: term } }
    ];
  }

  const hasSearch = Boolean(search && search.trim());

  const transactions = await Transaction.findAll({
    where,
    include: [
      {
        model: Participant,
        as: 'participant',
        attributes: ['id', 'name', 'qr_code'],
        where: hasSearch ? participantWhere : undefined,
        required: hasSearch
      },
      {
        model: Activity,
        as: 'activity',
        attributes: ['id', 'name', 'price']
      },
      {
        model: User,
        as: 'staff',
        attributes: ['id', 'name', 'username', 'role']
      }
    ],
    order: [['created_at', 'DESC']],
    raw: true,
    nest: true
  });

  const headers = [
    'ID Transaksi',
    'Waktu Transaksi',
    'ID Peserta',
    'Nama Peserta',
    'QR Code',
    'Aktivitas',
    'Tipe',
    'Jumlah (Rp)',
    'Saldo Sebelum (Rp)',
    'Saldo Sesudah (Rp)',
    'Petugas / Admin',
    'ID Referensi Refund',
    'Catatan'
  ];

  const rows = transactions.map((t) => [
    t.id,
    t.created_at ? new Date(t.created_at).toISOString() : '',
    t.participant_id,
    (t.participant && t.participant.name) ? t.participant.name : '',
    (t.participant && t.participant.qr_code) ? t.participant.qr_code : '',
    (t.activity && t.activity.name) ? t.activity.name : 'N/A',
    t.type,
    t.amount,
    t.balance_before,
    t.balance_after,
    (t.staff && (t.staff.name || t.staff.username)) ? (t.staff.name || t.staff.username) : 'N/A',
    t.reference_id || '',
    t.notes || ''
  ]);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const isExcel = ['excel', 'xlsx', 'xls'].includes(format.toLowerCase());

  if (isExcel) {
    return {
      data: buildXmlSpreadsheet('Transactions', headers, rows),
      contentType: 'application/vnd.ms-excel; charset=utf-8',
      filename: `transactions-report-${timestamp}.xls`
    };
  }

  return {
    data: buildCsv(headers, rows),
    contentType: 'text/csv; charset=utf-8',
    filename: `transactions-report-${timestamp}.csv`
  };
}

/**
 * Generates an export report for activity recap summary (per aktivitas)
 * containing transaction statistics, gross/net revenue, unique participants, and share %.
 *
 * @param {Object} query
 * @param {string} [query.format='csv'] - Output format ('csv', 'excel', 'xlsx', 'xls')
 * @param {string} [query.start_date] - Filter by start date
 * @param {string} [query.end_date] - Filter by end date
 * @param {string} [query.status] - Filter by activity status
 * @returns {Promise<{ data: string, contentType: string, filename: string }>}
 */
async function generateActivitiesRecapExport({
  format = 'csv',
  start_date,
  end_date,
  status
} = {}) {
  const adminReportService = require('./adminReportService');
  const recap = await adminReportService.getActivityTransactionsSummary({
    start_date,
    end_date,
    status
  });

  const headers = [
    'No',
    'Nama Aktivitas',
    'Status',
    'Tarif Satuan (Rp)',
    'Total Main',
    'Total Refund',
    'Total Kotor (Rp)',
    'Total Refund (Rp)',
    'Total Bersih (Rp)',
    'Partisipan',
    'Pangsa (%)'
  ];

  const rows = recap.activities.map((act, idx) => [
    idx + 1,
    act.name,
    act.status,
    act.price,
    act.deduction_count,
    act.refund_count,
    act.gross_amount,
    act.refund_amount,
    act.net_amount,
    act.unique_participants_count,
    `${act.share_percentage}%`
  ]);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const isExcel = ['excel', 'xlsx', 'xls'].includes(format.toLowerCase());

  if (isExcel) {
    return {
      data: buildXmlSpreadsheet('Rekap Aktivitas', headers, rows),
      contentType: 'application/vnd.ms-excel; charset=utf-8',
      filename: `activities-recap-report-${timestamp}.xls`
    };
  }

  return {
    data: buildCsv(headers, rows),
    contentType: 'text/csv; charset=utf-8',
    filename: `activities-recap-report-${timestamp}.csv`
  };
}

module.exports = {
  escapeCsvValue,
  escapeXml,
  buildCsv,
  buildXmlSpreadsheet,
  generateParticipantsExport,
  generateTransactionsExport,
  generateActivitiesRecapExport
};
