const Joi = require('joi');

const qrCodeParamSchema = Joi.object({
  qrCode: Joi.string().trim().min(3).max(128).required().messages({
    'string.base': 'Kode QR harus berupa teks.',
    'string.empty': 'Kode QR wajib diisi.',
    'string.min': 'Kode QR minimal terdiri dari 3 karakter.',
    'string.max': 'Kode QR maksimal terdiri dari 128 karakter.',
    'any.required': 'Kode QR wajib disertakan pada URL.'
  })
});

module.exports = {
  qrCodeParamSchema
};
