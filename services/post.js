const moment = require('moment');

const File = require('../models/file');
const Like = require('../models/like');
const Post = require('../models/post');

module.exports = {
    AddPost: async (file, description, user) => {
        try {
            const newPostEntry = await Post.create({
                userId: user.id,
                description
            });

            const suppEntry = await Promise.all([
                File.create({
                    postId: newPostEntry._id,
                    filename: `http://localhost:3099/uploads/${file.filename}`,
                    meta: file
                }),
                Like.create({
                    postId: newPostEntry._id
                })
            ]);

            const newUpdatedPost = await Post.findOneAndUpdate(
                {
                    _id: newPostEntry._id
                },
                { file: suppEntry[0]._id, likes: suppEntry[1]._id },
                { new: true, populate: 'file' }
            );
            return {
                message: 'Your post has been successfully uploaded.',
                post: newUpdatedPost
            };
        } catch (error) {
            return error;
        }
    },
    UpdatePost: async (postId, description, user) => {
        try {
            const postRecord = await Post.findOne({
                _id: postId,
                isDeleted: false
            }).lean();
            if (!postRecord)
                throw {
                    message: 'Post does not exist or may already been deleted.'
                };
            if (postRecord.userId != user.id)
                throw {
                    message: 'Post can only be updated by the owner.'
                };

            const updatedPost = await Post.findOneAndUpdate(
                { _id: postId },
                { description },
                { new: true, populate: 'file likes' }
            );

            return {
                message: 'Your post has been successfully updated.',
                post: updatedPost
            };
        } catch (error) {
            return error;
        }
    },
    DeletePost: async (postId, user) => {
        try {
            const postRecord = await Post.findOne({
                _id: postId,
                isDeleted: false
            }).lean();
            if (!postRecord)
                throw {
                    message: 'Post does not exist or may already been deleted.'
                };
            if (postRecord.userId != user.id)
                throw {
                    message: 'Post can only be deleted by the owner.'
                };

            const updatedPost = await Post.findOneAndUpdate(
                { _id: postId },
                { isDeleted: true },
                { new: true, populate: 'file' }
            );

            return {
                message: 'Your post has been successfully deleted.',
                post: updatedPost
            };
        } catch (error) {
            return error;
        }
    },
    GetPost: async (options) => {
        const { offset, numOfItems, before = moment() } = options;
        try {
            const postRecords = await Post.find({
                isDeleted: false,
                createdAt: { $lte: before }
            })
                .sort('-createdAt')
                .skip(offset)
                .limit(numOfItems)
                .populate([
                    { path: 'userId', select: 'username fullname' },
                    { path: 'file', select: 'filename' },
                    {
                        path: 'likes',
                        select: 'users count',
                        populate: {
                            path: 'users',
                            select: 'username fullname'
                        }
                    },
                    {
                        path: 'comments',
                        select: 'userId description commentLikes replies',
                        populate: {
                            path: 'userId',
                            select: 'username fullname'
                        },
                        options: { skip: 0, limit: 5 }
                    }
                ])
                .lean();

            return {
                posts: postRecords
            };
        } catch (error) {
            return error;
        }
    },
    ViewPost: async (postId) => {
        try {
            const postRecord = await Post.findOne({
                _id: postId,
                isDeleted: false
            })
                .populate([
                    { path: 'userId', select: 'username fullname' },
                    { path: 'file', select: 'filename' },
                    {
                        path: 'likes',
                        select: 'users count',
                        populate: {
                            path: 'users',
                            select: 'username fullname'
                        }
                    },
                    {
                        path: 'comments',
                        select: 'userId description commentLikes replies',
                        populate: {
                            path: 'userId',
                            select: 'username fullname'
                        },
                        options: { skip: 0, limit: 5 }
                    }
                ])
                .lean();

            if (!postRecord)
                throw {
                    message: 'Post does not exist or may already been deleted.'
                };

            return {
                post: postRecord
            };
        } catch (error) {
            return error;
        }
    },
    AddLike: async (postId, user) => {
        try {
            const postRecord = await Post.findOne({
                _id: postId,
                isDeleted: false
            })
                .populate({ path: 'likes', select: 'users count' })
                .lean();

            if (!postRecord)
                throw {
                    message: 'Post does not exist or may already been deleted.'
                };

            const userFound = postRecord.likes.users.find((u) => {
                return u == user.id;
            });

            if (userFound)
                throw { message: 'You have already liked this post.' };

            const updatedLike = await Like.findOneAndUpdate(
                { postId },
                { $push: { users: user.id }, $inc: { count: 1 } },
                { new: true }
            );

            return {
                message: 'You have successfully liked the post.',
                like: updatedLike
            };
        } catch (error) {
            return error;
        }
    },
    RemoveLike: async (postId, user) => {
        try {
            const postRecord = await Post.findOne({
                _id: postId,
                isDeleted: false
            })
                .populate({ path: 'likes', select: 'users count' })
                .lean();

            if (!postRecord)
                throw {
                    message: 'Post does not exist or may already been deleted.'
                };

            const userFound = postRecord.likes.users.find((u) => {
                return u == user.id;
            });

            if (!userFound)
                throw { message: 'You have not liked this post yet.' };

            const updatedLike = await Like.findOneAndUpdate(
                { postId },
                { $pull: { users: user.id }, $inc: { count: -1 } },
                { new: true }
            );

            return {
                message: 'You have successfully unliked the post.',
                like: updatedLike
            };
        } catch (error) {
            return error;
        }
    },
    PushComment: async (postId, commentId) => {
        try {
            const updatedPost = await Post.findOneAndUpdate(
                { _id: postId },
                { $push: { comments: commentId } },
                { new: true }
            );

            return {
                post: updatedPost
            };
        } catch (error) {
            return error;
        }
    },
    PullComment: async (postId, commentId) => {
        try {
            const updatedPost = await Post.findOneAndUpdate(
                { _id: postId },
                { $pull: { comments: commentId } },
                { new: true }
            );

            return {
                post: updatedPost
            };
        } catch (error) {
            return error;
        }
    }
};
