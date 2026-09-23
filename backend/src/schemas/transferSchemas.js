const Joi = require('joi');

const recipientParamSchema = Joi.object({
  qrCode: Joi.string().trim().min(3).max(128).required().messages({
    'string.base': 'Kode QR harus berupa teks.',
    'string.empty': 'Kode QR wajib diisi.',
    'string.min': 'Kode QR minimal terdiri dari 3 karakter.',
    'string.max': 'Kode QR maksimal terdiri dari 128 karakter.',
    'any.required': 'Kode QR wajib disertakan pada URL.'
  })
});

const recipientQuerySchema = Joi.object({
  sender_qr_code: Joi.string().trim().min(3).max(128).optional().messages({
    'string.base': 'Kode QR pengirim harus berupa teks.',
    'string.min': 'Kode QR pengirim minimal terdiri dari 3 karakter.',
    'string.max': 'Kode QR pengirim maksimal terdiri dari 128 karakter.'
  })
});

const transferPayloadSchema = Joi.object({
  sender_qr_code: Joi.string().trim().min(3).max(128).required().messages({
    'string.base': 'Kode QR pengirim harus berupa teks.',
    'string.empty': 'Kode QR pengirim wajib diisi.',
    'any.required': 'Kode QR pengirim wajib diisi.'
  }),
  recipient_qr_code: Joi.string()
    .trim()
    .min(3)
    .max(128)
    .required()
    .invalid(Joi.ref('sender_qr_code'))
    .messages({
      'string.base': 'Kode QR penerima harus berupa teks.',
      'string.empty': 'Kode QR penerima wajib diisi.',
      'any.invalid': 'Tidak dapat mentransfer saldo ke akun sendiri.',
      'any.required': 'Kode QR penerima wajib diisi.'
    }),
  amount: Joi.number().integer().min(1).required().messages({
    'number.base': 'Nominal transfer harus berupa angka.',
    'number.integer': 'Nominal transfer harus berupa bilangan bulat.',
    'number.min': 'Nominal transfer minimal Rp1.',
    'any.required': 'Nominal transfer wajib diisi.'
  }),
  notes: Joi.string().trim().max(255).allow('', null).optional().messages({
    'string.max': 'Catatan maksimal terdiri dari 255 karakter.'
  })
});

module.exports = {
  recipientParamSchema,
  recipientQuerySchema,
  transferPayloadSchema
};
