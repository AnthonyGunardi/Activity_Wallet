const Joi = require('joi');
const { ParticipantStatus } = require('../constants/enums');

const listParticipantsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().trim().allow(null, '').optional(),
  status: Joi.string().valid(ParticipantStatus.ACTIVE, ParticipantStatus.BLOCKED).optional()
});

const createParticipantSchema = Joi.object({
  name: Joi.string().trim().min(2).max(128).required().messages({
    'string.base': 'Nama peserta harus berupa teks.',
    'string.empty': 'Nama peserta wajib diisi.',
    'string.min': 'Nama peserta minimal 2 karakter.',
    'string.max': 'Nama peserta maksimal 128 karakter.',
    'any.required': 'Nama peserta wajib diisi.'
  }),
  initial_credit: Joi.number().integer().min(0).default(1000000),
  qr_code: Joi.string().trim().min(3).max(128).optional()
});

const bulkParticipantsSchema = Joi.object({
  participants: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().trim().min(2).max(128).required().messages({
          'string.empty': 'Nama peserta dalam daftar tidak boleh kosong.'
        }),
        initial_credit: Joi.number().integer().min(0).default(1000000),
        qr_code: Joi.string().trim().min(3).max(128).optional()
      })
    )
    .min(1)
    .required()
    .messages({
      'array.base': 'Daftar peserta harus berupa array.',
      'array.min': 'Daftar peserta minimal berisi 1 data.',
      'any.required': 'Daftar peserta wajib disertakan.'
    })
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid(ParticipantStatus.ACTIVE, ParticipantStatus.BLOCKED).required().messages({
    'any.only': 'Status harus bernilai ACTIVE atau BLOCKED.',
    'any.required': 'Status peserta wajib diisi.'
  })
});

module.exports = {
  listParticipantsQuerySchema,
  createParticipantSchema,
  bulkParticipantsSchema,
  updateStatusSchema
};
