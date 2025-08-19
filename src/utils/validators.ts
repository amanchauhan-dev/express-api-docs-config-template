import Joi from 'joi';

export const registerValidation = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(
      new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')
    )
    .required()
    .messages({
      'string.pattern.base':
        'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
    }),
});

export const loginValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const updateUserValidation = Joi.object({
  name: Joi.string().min(2).max(50),
  email: Joi.string().email(),
}).min(1);
