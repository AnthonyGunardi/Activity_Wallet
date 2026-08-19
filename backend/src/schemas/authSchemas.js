const Joi = require('joi');

const loginSchema = Joi.object({
  username: Joi.string().trim().min(3).max(64).required().messages({
    'string.base': 'Username harus berupa teks.',
    'string.empty': 'Username wajib diisi.',
    'string.min': 'Username minimal terdiri dari 3 karakter.',
    'string.max': 'Username maksimal terdiri dari 64 karakter.',
    'any.required': 'Username wajib diisi.'
  }),
  password: Joi.string().required().messages({
    'string.base': 'Kata sandi harus berupa teks.',
    'string.empty': 'Kata sandi wajib diisi.',
    'any.required': 'Kata sandi wajib diisi.'
  })
});

module.exports = {
  loginSchema
};
