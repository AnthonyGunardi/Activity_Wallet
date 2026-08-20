const Joi = require('joi');
const { ActivityStatus } = require('../constants/enums');

const listActivitiesQuerySchema = Joi.object({
  status: Joi.string().valid(ActivityStatus.ACTIVE, ActivityStatus.INACTIVE).optional()
});

const createActivitySchema = Joi.object({
  name: Joi.string().trim().min(2).max(128).required().messages({
    'string.base': 'Nama aktivitas harus berupa teks.',
    'string.empty': 'Nama aktivitas wajib diisi.',
    'string.min': 'Nama aktivitas minimal 2 karakter.',
    'string.max': 'Nama aktivitas maksimal 128 karakter.',
    'any.required': 'Nama aktivitas wajib diisi.'
  }),
  price: Joi.number().integer().min(0).required().messages({
    'number.base': 'Harga aktivitas harus berupa angka.',
    'number.integer': 'Harga aktivitas harus berupa bilangan bulat.',
    'number.min': 'Harga aktivitas tidak boleh bernilai negatif.',
    'any.required': 'Harga aktivitas wajib diisi.'
  }),
  description: Joi.string().trim().max(255).allow(null, '').optional().messages({
    'string.max': 'Deskripsi aktivitas maksimal 255 karakter.'
  }),
  status: Joi.string().valid(ActivityStatus.ACTIVE, ActivityStatus.INACTIVE).default(ActivityStatus.ACTIVE).messages({
    'any.only': 'Status harus bernilai ACTIVE atau INACTIVE.'
  })
});

const updateActivitySchema = Joi.object({
  name: Joi.string().trim().min(2).max(128).optional().messages({
    'string.base': 'Nama aktivitas harus berupa teks.',
    'string.min': 'Nama aktivitas minimal 2 karakter.',
    'string.max': 'Nama aktivitas maksimal 128 karakter.'
  }),
  price: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Harga aktivitas harus berupa angka.',
    'number.integer': 'Harga aktivitas harus berupa bilangan bulat.',
    'number.min': 'Harga aktivitas tidak boleh bernilai negatif.'
  }),
  description: Joi.string().trim().max(255).allow(null, '').optional().messages({
    'string.max': 'Deskripsi aktivitas maksimal 255 karakter.'
  }),
  status: Joi.string().valid(ActivityStatus.ACTIVE, ActivityStatus.INACTIVE).optional().messages({
    'any.only': 'Status harus bernilai ACTIVE atau INACTIVE.'
  })
}).min(1).messages({
  'object.min': 'Minimal satu kolom harus disertakan untuk pembaruan.'
});

module.exports = {
  listActivitiesQuerySchema,
  createActivitySchema,
  updateActivitySchema
};
