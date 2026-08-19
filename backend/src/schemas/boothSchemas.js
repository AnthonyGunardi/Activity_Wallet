const Joi = require('joi');

const scanSchema = Joi.object({
  qr_code: Joi.string().trim().min(3).max(128).required().messages({
    'string.base': 'Kode QR harus berupa teks.',
    'string.empty': 'Kode QR wajib diisi.',
    'string.min': 'Kode QR minimal terdiri dari 3 karakter.',
    'string.max': 'Kode QR maksimal terdiri dari 128 karakter.',
    'any.required': 'Kode QR wajib disertakan.'
  })
});

const deductionSchema = Joi.object({
  qr_code: Joi.string().trim().min(3).max(128).required().messages({
    'string.base': 'Kode QR harus berupa teks.',
    'string.empty': 'Kode QR wajib diisi.',
    'string.min': 'Kode QR minimal terdiri dari 3 karakter.',
    'string.max': 'Kode QR maksimal terdiri dari 128 karakter.',
    'any.required': 'Kode QR wajib disertakan.'
  }),
  activity_id: Joi.string().trim().required().messages({
    'string.base': 'ID Aktivitas harus berupa teks.',
    'string.empty': 'ID Aktivitas wajib diisi.',
    'any.required': 'ID Aktivitas wajib disertakan.'
  }),
  notes: Joi.string().trim().max(255).allow(null, '').optional().messages({
    'string.max': 'Catatan transaksi maksimal 255 karakter.'
  })
});

module.exports = {
  scanSchema,
  deductionSchema
};
