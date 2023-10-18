import Joi from 'joi';

const createPostValidation = Joi.object({
    text: Joi.string().max(140).required(),
    user_id: Joi.number().integer().required()
});

const getPostValidation = Joi.number().integer().required();

const likePostValidation = Joi.object({
    user_id: Joi.number().integer().required(),
    post_id: Joi.number().integer().required()
});

const replyPostValidation = Joi.object({
    text: Joi.string().max(140).required(),
    post_id: Joi.number().integer().required(),
    user_id: Joi.number().integer().required()
});

const getAllPostValidation = Joi.object({
    user_id: Joi.number().integer().required(),
    offset: Joi.string().optional(),
    limit: Joi.string().optional()
});

export {
    createPostValidation,
    getPostValidation,
    likePostValidation,
    replyPostValidation,
    getAllPostValidation
};
