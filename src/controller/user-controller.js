import userService from '../service/user-service.js';

const register = async (req, res, next) => {
    try {
        const result = await userService.register(req.body);
        res.status(200).json({
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const result = await userService.login(req.body);
        res.status(200).json({
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const get = async (req, res, next) => {
    try {
        const id = req.user.id;
        const result = await userService.get(id);
        res.status(200).json({
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        const data = req.body;
        data.id = req.user.id;
        const result = await userService.update(data);
        res.status(200).json({
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const logout = async (req, res, next) => {
    try {
        const id = req.user.id;
        await userService.logout(id);
        res.status(200).json({
            data: 'OK'
        });
    } catch (error) {
        next(error);
    }
};

export default {
    register,
    login,
    get,
    update,
    logout
};
