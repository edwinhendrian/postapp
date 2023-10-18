import Joi from 'joi';

const registerUserValidation = Joi.object({
    username: Joi.string().max(100).required(),
    email: Joi.string()
        .max(100)
        .email({ tlds: { allow: false } })
        .required(),
    password: Joi.string().max(100).required(),
    name: Joi.string().max(100).required()
});

const loginUserValidation = Joi.object({
    username: Joi.string().max(100).required(),
    password: Joi.string().max(100).required()
});

const getUserValidation = Joi.number().integer().required();

const updateUserValidation = Joi.object({
    id: Joi.number().integer().required(),
    username: Joi.string().max(100).optional(),
    email: Joi.string()
        .max(100)
        .email({ tlds: { allow: false } })
        .optional(),
    password: Joi.string().max(100).optional(),
    name: Joi.string().max(100).optional()
});

export {
    registerUserValidation,
    loginUserValidation,
    getUserValidation,
    updateUserValidation
};
