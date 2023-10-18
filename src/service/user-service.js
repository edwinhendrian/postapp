import { validate } from '../validation/validation.js';
import {
    loginUserValidation,
    registerUserValidation,
    getUserValidation,
    updateUserValidation
} from '../validation/user-validation.js';
import { prismaClient } from '../application/database.js';
import { ResponseError } from '../error/response-error.js';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

const register = async (data) => {
    const user = validate(registerUserValidation, data);

    const countUser = await prismaClient.user.count({
        where: {
            OR: [{ username: user.username }, { email: user.email }]
        }
    });

    if (countUser === 1)
        throw new ResponseError(400, 'Username or Email already exists');

    user.password = await bcrypt.hash(user.password, 10);

    return prismaClient.user.create({
        data: user,
        select: {
            id: true,
            username: true,
            email: true,
            name: true
        }
    });
};

const login = async (data) => {
    const loginRequest = validate(loginUserValidation, data);

    const user = await prismaClient.user.findFirst({
        where: {
            OR: [
                {
                    username: loginRequest.username
                },
                {
                    email: loginRequest.username
                }
            ]
        },
        select: {
            id: true,
            password: true
        }
    });

    if (!user) throw new ResponseError(401, 'Username or password wrong');

    const isPasswordValid = await bcrypt.compare(
        loginRequest.password,
        user.password
    );
    if (!isPasswordValid)
        throw new ResponseError(401, 'Username or password wrong');

    const token = uuid().toString();
    return await prismaClient.user.update({
        data: {
            token
        },
        where: {
            id: user.id
        },
        select: {
            token: true
        }
    });
};

const get = async (id) => {
    id = validate(getUserValidation, id);

    const user = await prismaClient.user.findUnique({
        where: {
            id
        },
        select: {
            id: true,
            username: true,
            email: true,
            name: true
        }
    });

    if (!user) throw new ResponseError(404, 'User is not found');

    return user;
};

const update = async (data) => {
    const updateRequest = validate(updateUserValidation, data);

    const userCount = await prismaClient.user.count({
        where: { id: updateRequest.id }
    });

    if (userCount !== 1) throw new ResponseError(404, 'User is not found');

    const updateData = {};
    if (updateRequest.username) updateData.username = updateRequest.username;
    if (updateRequest.email) updateData.email = updateRequest.email;
    if (updateRequest.name) updateData.name = updateRequest.name;
    if (updateRequest.password)
        updateData.password = await bcrypt.hash(updateRequest.password, 10);

    return prismaClient.user.update({
        data: updateData,
        where: {
            id: updateRequest.id
        },
        select: {
            id: true,
            username: true,
            email: true,
            name: true,
            password: true
        }
    });
};

const logout = async (id) => {
    id = validate(getUserValidation, id);

    const user = await prismaClient.user.findUnique({
        where: {
            id
        },
        select: {
            id: true
        }
    });

    if (!user) throw new ResponseError(404, 'User is not found');

    return prismaClient.user.update({
        data: {
            token: null
        },
        where: {
            id
        }
    });
};

export default {
    register,
    login,
    get,
    update,
    logout
};
