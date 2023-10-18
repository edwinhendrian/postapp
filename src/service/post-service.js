import { validate } from '../validation/validation.js';
import {
    createPostValidation,
    getAllPostValidation,
    getPostValidation,
    likePostValidation,
    replyPostValidation
} from '../validation/post-validation.js';
import { prismaClient } from '../application/database.js';
import { ResponseError } from '../error/response-error.js';

const create = async (data) => {
    const postRequest = validate(createPostValidation, data);

    return prismaClient.post.create({
        data: postRequest,
        select: {
            id: true,
            text: true,
            reply_count: true,
            like_count: true,
            user: {
                select: {
                    id: true,
                    username: true,
                    name: true
                }
            },
            created_at: true,
            updated_at: true
        }
    });
};

const get = async (id) => {
    id = validate(getPostValidation, id);

    const post = await prismaClient.post.findUnique({
        where: { id },
        select: {
            id: true,
            text: true,
            post: {
                select: {
                    id: true,
                    text: true,
                    reply_count: true,
                    like_count: true,
                    user: {
                        select: {
                            id: true,
                            username: true,
                            name: true
                        }
                    },
                    created_at: true,
                    updated_at: true
                }
            },
            replies: {
                select: {
                    id: true,
                    text: true,
                    reply_count: true,
                    like_count: true,
                    user: {
                        select: {
                            id: true,
                            username: true,
                            name: true
                        }
                    },
                    created_at: true,
                    updated_at: true
                },
                orderBy: {
                    created_at: 'desc'
                },
                take: 10
            },
            reply_count: true,
            like_count: true,
            user: {
                select: {
                    id: true,
                    username: true,
                    name: true
                }
            },
            created_at: true,
            updated_at: true
        }
    });

    if (!post) throw new ResponseError(404, 'Post is not found');

    return post;
};

const reply = async (data) => {
    const replyRequest = validate(replyPostValidation, data);

    const countPost = await prismaClient.post.count({
        where: { id: replyRequest.post_id }
    });

    if (countPost < 1) throw new ResponseError(404, 'Post is not found');

    const reply = await prismaClient.post.create({
        data: replyRequest,
        select: {
            id: true,
            text: true,
            post_id: true,
            reply_count: true,
            like_count: true,
            user: {
                select: {
                    id: true,
                    username: true,
                    name: true
                }
            },
            created_at: true,
            updated_at: true
        }
    });

    await prismaClient.post.update({
        data: { reply_count: { increment: 1 } },
        where: { id: reply.post_id }
    });

    return reply;
};

const remove = async (data) => {
    const removeRequest = validate(likePostValidation, data);

    const post = await prismaClient.post.findFirst({
        where: { id: removeRequest.post_id },
        select: { id: true, post: true, user_id: true }
    });

    if (!post) throw new ResponseError(404, 'Post is not found');
    if (removeRequest.user_id !== post.user_id)
        throw new ResponseError(401, 'Cannot delete post that are not yours');

    await prismaClient.like.deleteMany({ where: { post_id: post.id } }); // delete likes

    if (post.post === null)
        return prismaClient.post.delete({ where: { id: post.id } });
    else {
        return Promise.all([
            prismaClient.post.delete({ where: { id: post.id } }),
            prismaClient.post.update({
                data: { reply_count: { decrement: 1 } },
                where: { id: post.id }
            })
        ]);
    }
};

const like = async (data) => {
    const likeRequest = validate(likePostValidation, data);

    const countPost = await prismaClient.post.count({
        where: { id: likeRequest.post_id }
    });

    if (countPost < 1) throw new ResponseError(404, 'Post is not found');

    const countLike = await prismaClient.like.count({
        where: likeRequest
    });

    if (countLike === 1) throw new ResponseError(400, 'Already liked the post');

    await prismaClient.like.create({ data: likeRequest });

    return prismaClient.post.update({
        data: { like_count: { increment: 1 } },
        where: { id: likeRequest.post_id }
    });
};

const unlike = async (data) => {
    const likeRequest = validate(likePostValidation, data);

    const countPost = await prismaClient.post.count({
        where: { id: likeRequest.post_id }
    });

    if (countPost < 1) throw new ResponseError(404, 'Post is not found');

    const countLike = await prismaClient.like.count({
        where: likeRequest
    });

    if (countLike < 1) throw new ResponseError(400, 'Like is not found');

    await prismaClient.like.deleteMany({ where: likeRequest });

    return prismaClient.post.update({
        data: { like_count: { decrement: 1 } },
        where: { id: likeRequest.post_id }
    });
};

const getAllByUserId = async (data) => {
    const getRequest = validate(getAllPostValidation, data);

    return prismaClient.post.findMany({
        where: { user_id: getRequest.user_id, post_id: null },
        select: {
            id: true,
            text: true,
            replies: {
                select: {
                    id: true,
                    text: true,
                    reply_count: true,
                    like_count: true,
                    user: {
                        select: {
                            id: true,
                            username: true,
                            name: true
                        }
                    },
                    created_at: true,
                    updated_at: true
                },
                orderBy: {
                    created_at: 'desc'
                },
                take: 10
            },
            reply_count: true,
            like_count: true,
            user: {
                select: {
                    id: true,
                    username: true,
                    name: true
                }
            },
            created_at: true,
            updated_at: true
        },
        orderBy: {
            created_at: 'desc'
        },
        take: getRequest.limit ? parseInt(getRequest.limit, 10) : undefined,
        skip: getRequest.offset ? parseInt(getRequest.offset, 10) : undefined
    });
};

const getAllReplyByUserId = async (data) => {
    const getRequest = validate(getAllPostValidation, data);

    return prismaClient.post.findMany({
        where: { user_id: getRequest.user_id, NOT: { post_id: null } },
        select: {
            id: true,
            text: true,
            post: {
                select: {
                    id: true,
                    text: true,
                    reply_count: true,
                    like_count: true,
                    user: {
                        select: {
                            id: true,
                            username: true,
                            name: true
                        }
                    },
                    created_at: true,
                    updated_at: true
                }
            },
            replies: {
                select: {
                    id: true,
                    text: true,
                    reply_count: true,
                    like_count: true,
                    user: {
                        select: {
                            id: true,
                            username: true,
                            name: true
                        }
                    },
                    created_at: true,
                    updated_at: true
                },
                orderBy: {
                    created_at: 'desc'
                },
                take: 10
            },
            reply_count: true,
            like_count: true,
            user: {
                select: {
                    id: true,
                    username: true,
                    name: true
                }
            },
            created_at: true,
            updated_at: true
        },
        orderBy: {
            created_at: 'desc'
        },
        take: getRequest.limit ? parseInt(getRequest.limit, 10) : undefined,
        skip: getRequest.offset ? parseInt(getRequest.offset, 10) : undefined
    });
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
