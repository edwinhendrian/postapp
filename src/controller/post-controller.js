import postService from '../service/post-service.js';

const create = async (req, res, next) => {
    try {
        const data = req.body;
        data.user_id = req.user.id;
        const result = await postService.create(data);
        res.status(200).json({
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const get = async (req, res, next) => {
    try {
        const id = req.params.post_id;
        const result = await postService.get(id);
        res.status(200).json({
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const reply = async (req, res, next) => {
    try {
        const data = req.body;
        data.post_id = req.params.post_id;
        data.user_id = req.user.id;
        const result = await postService.reply(data);
        res.status(200).json({
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        const data = {
            user_id: req.user.id,
            post_id: req.params.post_id
        };
        await postService.remove(data);
        res.status(200).json({
            data: 'OK'
        });
    } catch (error) {
        next(error);
    }
};

const like = async (req, res, next) => {
    try {
        const data = {
            user_id: req.user.id,
            post_id: req.params.post_id
        };
        await postService.like(data);
        res.status(200).json({
            data: 'OK'
        });
    } catch (error) {
        next(error);
    }
};

const unlike = async (req, res, next) => {
    try {
        const data = {
            user_id: req.user.id,
            post_id: req.params.post_id
        };
        await postService.unlike(data);
        res.status(200).json({
            data: 'OK'
        });
    } catch (error) {
        next(error);
    }
};

const getAllByUserId = async (req, res, next) => {
    try {
        const data = {
            user_id: req.params.user_id,
            offset: req.query.offset,
            limit: req.query.limit
        };
        const result = await postService.getAllByUserId(data);
        res.status(200).json({
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getAllReplyByUserId = async (req, res, next) => {
    try {
        const data = {
            user_id: req.params.user_id,
            offset: req.query.offset,
            limit: req.query.limit
        };
        const result = await postService.getAllReplyByUserId(data);
        res.status(200).json({
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export default {
    create,
    get,
    reply,
    remove,
    like,
    unlike,
    getAllByUserId,
    getAllReplyByUserId
};
