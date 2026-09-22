const {
  escapeCsvValue,
  escapeXml,
  buildCsv,
  buildXmlSpreadsheet,
  generateParticipantsExport,
  generateTransactionsExport,
  generateActivitiesRecapExport
} = require('../../src/services/exportService');
const { sequelize, Participant, Transaction, Activity, User } = require('../../src/models');
const { ParticipantStatus, TransactionType, UserRole } = require('../../src/constants/enums');

describe('ExportService Unit Tests', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });
  describe('escapeCsvValue', () => {
    it('returns empty quotes for null or undefined', () => {
      expect(escapeCsvValue(null)).toBe('""');
      expect(escapeCsvValue(undefined)).toBe('""');
    });

    it('formats numbers as strings without extra quotes if simple', () => {
      expect(escapeCsvValue(1000000)).toBe('1000000');
      expect(escapeCsvValue(0)).toBe('0');
    });

    it('escapes quotes by doubling them and wrapping in quotes', () => {
      expect(escapeCsvValue('Hello "World"')).toBe('"Hello ""World"""');
    });

    it('wraps in quotes if value contains commas or newlines', () => {
      expect(escapeCsvValue('Jakarta, Indonesia')).toBe('"Jakarta, Indonesia"');
      expect(escapeCsvValue('Line 1\nLine 2')).toBe('"Line 1\nLine 2"');
    });

    it('neutralizes spreadsheet formula injection prefixes (=, +, -, @, \\t, \\r)', () => {
      expect(escapeCsvValue('=SUM(A1:A10)')).toBe("'\t=SUM(A1:A10)");
      expect(escapeCsvValue('+cmd|...')).toBe("'\t+cmd|...");
      expect(escapeCsvValue('-cmd|...')).toBe("'\t-cmd|...");
      expect(escapeCsvValue('@something')).toBe("'\t@something");
    });
  });

  describe('buildCsv', () => {
    it('builds RFC 4180 CSV with UTF-8 BOM and CRLF', () => {
      const headers = ['Name', 'Balance'];
      const rows = [
        ['John Doe', 1000000],
        ['Jane "Special" Smith', 500000]
      ];

      const csv = buildCsv(headers, rows);
      expect(csv.startsWith('\uFEFF')).toBe(true);
      expect(csv).toContain('Name,Balance\r\n');
      expect(csv).toContain('"John Doe",1000000\r\n');
      expect(csv).toContain('"Jane ""Special"" Smith",500000');
    });
  });

  describe('buildXmlSpreadsheet', () => {
    it('generates valid Excel XML spreadsheet markup', () => {
      const headers = ['Name', 'Balance'];
      const rows = [['John Doe', 1000000]];

      const xml = buildXmlSpreadsheet('Participants', headers, rows);
      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"');
      expect(xml).toContain('<Worksheet ss:Name="Participants">');
      expect(xml).toContain('<Data ss:Type="String">Name</Data>');
      expect(xml).toContain('<Data ss:Type="Number">1000000</Data>');
    });

    it('escapes XML special characters in string cells', () => {
      expect(escapeXml(null)).toBe('');
      expect(escapeXml(undefined)).toBe('');
      expect(escapeXml('Hello & <World> "Test" \'Apos\'')).toBe('Hello &amp; &lt;World&gt; &quot;Test&quot; &apos;Apos&apos;');

      const headers = ['Note'];
      const rows = [['<tag> & "quote" & \'apos\'']];

      const xml = buildXmlSpreadsheet('Notes', headers, rows);
      expect(xml).toContain('&lt;tag&gt; &amp; &quot;quote&quot; &amp; &apos;apos&apos;');
    });
  });

  describe('generateParticipantsExport', () => {
    beforeEach(async () => {
      await Participant.destroy({ where: {}, truncate: true });
      await Participant.create({
        name: 'Budi Santoso',
        qr_code: 'SEPA-TEST01',
        initial_credit: 1000000,
        current_balance: 650000,
        total_spent: 350000,
        status: ParticipantStatus.ACTIVE
      });
      await Participant.create({
        name: 'Siti Rahma',
        qr_code: 'SEPA-TEST02',
        initial_credit: 1000000,
        current_balance: 1000000,
        total_spent: 0,
        status: ParticipantStatus.BLOCKED
      });
    });

    it('generates CSV participant report', async () => {
      const result = await generateParticipantsExport({ format: 'csv' });
      expect(result.contentType).toBe('text/csv; charset=utf-8');
      expect(result.filename).toMatch(/^participants-report-.*\.csv$/);
      expect(result.data).toContain('Budi Santoso');
      expect(result.data).toContain('SEPA-TEST01');
      expect(result.data).toContain('650000');
      expect(result.data).toContain('Siti Rahma');
    });

    it('generates Excel XML participant report when format is excel/xlsx', async () => {
      const result = await generateParticipantsExport({ format: 'excel' });
      expect(result.contentType).toBe('application/vnd.ms-excel; charset=utf-8');
      expect(result.filename).toMatch(/^participants-report-.*\.xls$/);
      expect(result.data).toContain('<Worksheet ss:Name="Participants">');
      expect(result.data).toContain('Budi Santoso');
    });

    it('filters participants by status and search', async () => {
      const result = await generateParticipantsExport({ format: 'csv', status: ParticipantStatus.BLOCKED });
      expect(result.data).toContain('Siti Rahma');
      expect(result.data).not.toContain('Budi Santoso');

      const searchResult = await generateParticipantsExport({ format: 'csv', search: 'Budi' });
      expect(searchResult.data).toContain('Budi Santoso');
      expect(searchResult.data).not.toContain('Siti Rahma');
    });
  });

  describe('generateTransactionsExport', () => {
    let participant;
    let activity;
    let staff;

    beforeEach(async () => {
      await Transaction.destroy({ where: {}, truncate: true });
      await Activity.destroy({ where: {}, truncate: true });
      await Participant.destroy({ where: {}, truncate: true });
      await User.destroy({ where: {}, truncate: true });

      participant = await Participant.create({
        name: 'Ahmad Dahlan',
        qr_code: 'SEPA-AHMAD01',
        initial_credit: 1000000,
        current_balance: 650000,
        total_spent: 350000,
        status: ParticipantStatus.ACTIVE
      });

      activity = await Activity.create({
        name: 'Jet Ski',
        price: 350000,
        status: 'ACTIVE'
      });

      staff = await User.create({
        name: 'Staff Booth 1',
        username: 'staff1',
        password_hash: 'hash',
        role: UserRole.STAFF
      });

      await Transaction.create({
        participant_id: participant.id,
        activity_id: activity.id,
        staff_id: staff.id,
        type: TransactionType.DEDUCTION,
        amount: 350000,
        balance_before: 1000000,
        balance_after: 650000,
        notes: 'Sewa Jet Ski 15 Menit'
      });
    });

    it('generates CSV transaction audit ledger report', async () => {
      const result = await generateTransactionsExport({ format: 'csv' });
      expect(result.contentType).toBe('text/csv; charset=utf-8');
      expect(result.filename).toMatch(/^transactions-report-.*\.csv$/);
      expect(result.data).toContain('Ahmad Dahlan');
      expect(result.data).toContain('Jet Ski');
      expect(result.data).toContain('DEDUCTION');
      expect(result.data).toContain('350000');
      expect(result.data).toContain('Staff Booth 1');
    });

    it('generates Excel XML transaction report when format is excel', async () => {
      const result = await generateTransactionsExport({ format: 'excel' });
      expect(result.contentType).toBe('application/vnd.ms-excel; charset=utf-8');
      expect(result.filename).toMatch(/^transactions-report-.*\.xls$/);
      expect(result.data).toContain('<Worksheet ss:Name="Transactions">');
      expect(result.data).toContain('Ahmad Dahlan');
    });

    it('filters transactions by participant, activity, staff, type, date, and search', async () => {
      const filtered = await generateTransactionsExport({
        format: 'csv',
        participant_id: participant.id,
        activity_id: activity.id,
        staff_id: staff.id,
        type: TransactionType.DEDUCTION,
        start_date: new Date(Date.now() - 3600000).toISOString(),
        end_date: new Date(Date.now() + 3600000).toISOString(),
        search: 'Ahmad'
      });

      expect(filtered.data).toContain('Ahmad Dahlan');
      expect(filtered.data).toContain('Jet Ski');
    });

    it('handles headers with commas and quotes in buildCsv', () => {
      const csv = buildCsv(['Col, 1', 'Col "2"'], [['Val 1', 'Val 2']]);
      expect(csv).toContain('"Col, 1"');
      expect(csv).toContain('"Col ""2"""');
    });

    it('defaults sheetName to Report when null or empty in buildXmlSpreadsheet', () => {
      const xml = buildXmlSpreadsheet(null, ['Col 1'], [['Val 1']]);
      expect(xml).toContain('<Worksheet ss:Name="Report">');
    });

    it('handles transactions with null or empty relational fields', async () => {
      const orphanTx = await Transaction.create({
        participant_id: participant.id,
        staff_id: staff.id,
        type: TransactionType.ADJUSTMENT,
        amount: 10000,
        balance_before: 100000,
        balance_after: 110000
      });

      const exportRes = await generateTransactionsExport({ format: 'csv' });
      expect(exportRes.data).toContain(orphanTx.id);
      expect(exportRes.data).toContain('N/A');
    });
  });

  describe('generateActivitiesRecapExport', () => {
    beforeEach(async () => {
      await Transaction.destroy({ where: {}, truncate: true });
      await Activity.destroy({ where: {}, truncate: true });
      await Participant.destroy({ where: {}, truncate: true });
      await User.destroy({ where: {}, truncate: true });

      const staff = await User.create({
        name: 'Staff Wahana',
        username: 'staff_w',
        password_hash: 'hash',
        role: UserRole.STAFF
      });

      const participant = await Participant.create({
        name: 'Budi Wahana',
        qr_code: 'SEPA-W1',
        initial_credit: 1000000,
        current_balance: 350000,
        total_spent: 650000,
        status: ParticipantStatus.ACTIVE
      });

      const activity = await Activity.create({
        name: 'Jetski Pro',
        price: 650000,
        status: 'ACTIVE'
      });

      await Transaction.create({
        participant_id: participant.id,
        activity_id: activity.id,
        staff_id: staff.id,
        type: TransactionType.DEDUCTION,
        amount: 650000,
        balance_before: 1000000,
        balance_after: 350000
      });
    });

    it('generates CSV activity recap report with correct headers and data', async () => {
      const result = await generateActivitiesRecapExport({ format: 'csv' });
      expect(result.contentType).toBe('text/csv; charset=utf-8');
      expect(result.filename).toMatch(/^activities-recap-report-.*\.csv$/);
      expect(result.data).toContain('Nama Aktivitas');
      expect(result.data).toContain('Jetski Pro');
      expect(result.data).toContain('650000');
      expect(result.data).toContain('100%');
    });

    it('generates Excel XML activity recap report when requested', async () => {
      const result = await generateActivitiesRecapExport({ format: 'excel' });
      expect(result.contentType).toBe('application/vnd.ms-excel; charset=utf-8');
      expect(result.filename).toMatch(/^activities-recap-report-.*\.xls$/);
      expect(result.data).toContain('<Worksheet ss:Name="Rekap Wahana">');
      expect(result.data).toContain('Jetski Pro');
    });
  });
});
