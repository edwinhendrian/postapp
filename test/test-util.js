import { prismaClient } from '../src/application/database.js';
import bcrypt from 'bcrypt';

export const createTestUser = async () => {
    await prismaClient.user.create({
        data: {
            username: 'test',
            email: 'test@gmail.com',
            password: await bcrypt.hash('rahasia', 10),
            name: 'User Test',
            token: 'test-token'
        }
    });
};

export const createTestUser2 = async () => {
    await prismaClient.user.create({
        data: {
            username: 'test2',
            email: 'test2@gmail.com',
            password: await bcrypt.hash('rahasia', 10),
            name: 'User Test 2',
            token: 'test-token-2'
        }
    });
};

export const removeTestUser = async () => {
    await prismaClient.user.deleteMany({
        where: {
            OR: [
                { username: 'test' },
                { username: 'testganti' },
                { username: 'test2' }
            ]
        }
    });
};

export const getTestUser = async () => {
    return prismaClient.user.findFirst({
        where: {
            OR: [{ username: 'test' }, { username: 'testganti' }]
        }
    });
};

export const createTestPost = async (user_id) => {
    await prismaClient.post.create({
        data: { text: 'test post', user_id }
    });
};

export const updateTestPost = async (id, data) => {
    return prismaClient.post.update({
        data,
        where: { id }
    });
};

export const removeTestPost = async () => {
    await prismaClient.post.deleteMany({
        where: {
            OR: [
                { text: 'test post' },
                { text: 'test post update' },
                { text: 'test reply' }
            ]
        }
    });
};

export const getTestPost = async () => {
    return prismaClient.post.findFirst({
        where: {
            OR: [{ text: 'test post' }, { text: 'test post update' }]
        }
    });
};

export const createTestLike = async (post_id, user_id) => {
    await prismaClient.like.create({
        data: { post_id, user_id }
    });
};

export const removeTestLike = async (post_id, user_id) => {
    await prismaClient.like.deleteMany({
        where: { post_id, user_id }
    });
};

export const createTestReply = async (post_id, user_id) => {
    await prismaClient.post.create({
        data: { text: 'test reply', post_id, user_id }
    });
};
