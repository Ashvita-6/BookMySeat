// library-seat-backend/src/middleware/validation.js
const Joi = require('joi');

const validateUser = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().min(2).max(50).required(),
    student_id: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const validateBooking = (req, res, next) => {
  const schema = Joi.object({
    // Updated to accept both string (ObjectId) and number
    seat_id: Joi.alternatives().try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/), // MongoDB ObjectId pattern
      Joi.number().integer().positive()
    ).required().messages({
      'alternatives.match': 'seat_id must be a valid ObjectId or positive number',
      'any.required': 'seat_id is required'
    }),
    start_time: Joi.date().iso().min('now').required().messages({
      'date.min': 'Start time must be in the future'
    }),
    end_time: Joi.date().iso().greater(Joi.ref('start_time')).required().messages({
      'date.greater': 'End time must be after start time'
    })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = { validateUser, validateLogin, validateBooking };