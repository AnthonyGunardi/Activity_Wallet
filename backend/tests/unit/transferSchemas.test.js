const {
  recipientParamSchema,
  recipientQuerySchema,
  transferPayloadSchema
} = require('../../src/schemas/transferSchemas');

describe('transferSchemas Unit Tests', () => {
  describe('recipientParamSchema', () => {
    test('should validate valid qrCode param', () => {
      const { error, value } = recipientParamSchema.validate({ qrCode: 'SEPA-123456' });
      expect(error).toBeUndefined();
      expect(value.qrCode).toBe('SEPA-123456');
    });

    test('should reject missing qrCode param', () => {
      const { error } = recipientParamSchema.validate({});
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('qrCode');
    });

    test('should reject empty or whitespace qrCode param', () => {
      const { error } = recipientParamSchema.validate({ qrCode: '   ' });
      expect(error).toBeDefined();
    });
  });

  describe('recipientQuerySchema', () => {
    test('should validate when sender_qr_code is provided', () => {
      const { error, value } = recipientQuerySchema.validate({ sender_qr_code: 'SEPA-SENDER01' });
      expect(error).toBeUndefined();
      expect(value.sender_qr_code).toBe('SEPA-SENDER01');
    });

    test('should validate when sender_qr_code is omitted', () => {
      const { error, value } = recipientQuerySchema.validate({});
      expect(error).toBeUndefined();
      expect(value.sender_qr_code).toBeUndefined();
    });

    test('should reject invalid length, empty string, or whitespace for sender_qr_code', () => {
      expect(recipientQuerySchema.validate({ sender_qr_code: '' }).error).toBeDefined();
      expect(recipientQuerySchema.validate({ sender_qr_code: '   ' }).error).toBeDefined();
      expect(recipientQuerySchema.validate({ sender_qr_code: 'AB' }).error).toBeDefined();
      expect(recipientQuerySchema.validate({ sender_qr_code: 'A'.repeat(129) }).error).toBeDefined();
    });
  });

  describe('transferPayloadSchema', () => {
    test('should validate valid transfer payload', () => {
      const payload = {
        sender_qr_code: 'SEPA-SENDER01',
        recipient_qr_code: 'SEPA-RECIPIENT02',
        amount: 50000,
        notes: 'Transfer untuk Jet Ski'
      };
      const { error, value } = transferPayloadSchema.validate(payload);
      expect(error).toBeUndefined();
      expect(value.amount).toBe(50000);
      expect(value.notes).toBe('Transfer untuk Jet Ski');
    });

    test('should allow payload without optional notes', () => {
      const payload = {
        sender_qr_code: 'SEPA-SENDER01',
        recipient_qr_code: 'SEPA-RECIPIENT02',
        amount: 25000
      };
      const { error, value } = transferPayloadSchema.validate(payload);
      expect(error).toBeUndefined();
      expect(value.notes).toBeUndefined();
    });

    test('should reject self-transfer (identical sender and recipient codes)', () => {
      const payload = {
        sender_qr_code: 'SEPA-SAME01',
        recipient_qr_code: 'SEPA-SAME01',
        amount: 50000
      };
      const { error } = transferPayloadSchema.validate(payload);
      expect(error).toBeDefined();
      expect(error.details[0].message).toMatch(/tidak dapat mentransfer saldo ke akun sendiri|cannot be equal to|self-transfer/i);
    });

    test('should reject non-positive amounts', () => {
      const payloadZero = {
        sender_qr_code: 'SEPA-SENDER01',
        recipient_qr_code: 'SEPA-RECIPIENT02',
        amount: 0
      };
      const { error: errorZero } = transferPayloadSchema.validate(payloadZero);
      expect(errorZero).toBeDefined();

      const payloadNegative = {
        sender_qr_code: 'SEPA-SENDER01',
        recipient_qr_code: 'SEPA-RECIPIENT02',
        amount: -10000
      };
      const { error: errorNegative } = transferPayloadSchema.validate(payloadNegative);
      expect(errorNegative).toBeDefined();
    });

    test('should reject non-integer amount', () => {
      const payload = {
        sender_qr_code: 'SEPA-SENDER01',
        recipient_qr_code: 'SEPA-RECIPIENT02',
        amount: 45000.5
      };
      const { error } = transferPayloadSchema.validate(payload);
      expect(error).toBeDefined();
    });

    test('should reject missing required fields', () => {
      const { error: noSender } = transferPayloadSchema.validate({
        recipient_qr_code: 'SEPA-REC',
        amount: 50000
      });
      expect(noSender).toBeDefined();

      const { error: noRecipient } = transferPayloadSchema.validate({
        sender_qr_code: 'SEPA-SEND',
        amount: 50000
      });
      expect(noRecipient).toBeDefined();

      const { error: noAmount } = transferPayloadSchema.validate({
        sender_qr_code: 'SEPA-SEND',
        recipient_qr_code: 'SEPA-REC'
      });
      expect(noAmount).toBeDefined();
    });

    test('should reject overly long notes (> 255 chars)', () => {
      const payload = {
        sender_qr_code: 'SEPA-SENDER01',
        recipient_qr_code: 'SEPA-RECIPIENT02',
        amount: 50000,
        notes: 'A'.repeat(256)
      };
      const { error } = transferPayloadSchema.validate(payload);
      expect(error).toBeDefined();
    });
  });
});
