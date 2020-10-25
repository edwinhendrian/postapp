const moment = require('moment');

const PostService = require('./post');

const Comment = require('../models/comment');
const CommentLike = require('../models/commentLike');
const Post = require('../models/post');

module.exports = {
    AddComment: async (commentData, user) => {
        const { postId, description } = commentData;
        try {
            const postRecord = await Post.findOne({
                _id: postId,
                isDeleted: false
            }).lean();
            if (!postRecord)
                throw {
                    message: 'Post does not exist or may already been deleted.'
                };

            const newCommentEntry = await Comment.create({
                userId: user.id,
                postId,
                description
            });

            const commentLikeEntry = await CommentLike.create({
                commentId: newCommentEntry._id
            });

            await PostService.PushComment(postId, newCommentEntry._id);

            const newUpdatedComment = await Comment.findOneAndUpdate(
                {
                    _id: newCommentEntry._id
                },
                { commentLikes: commentLikeEntry._id },
                { new: true }
            );

            return {
                message: 'Your comment has been successfully uploaded.',
                comment: newUpdatedComment
            };
        } catch (error) {
            return error;
        }
    },
    UpdateComment: async (commentId, description, user) => {
        try {
            const commentRecord = await Comment.findOne({
                _id: commentId,
                isDeleted: false
            }).lean();
            if (!commentRecord)
                throw {
                    message:
                        'Comment does not exist or may already been deleted.'
                };
            if (commentRecord.userId != user.id)
                throw {
                    message: 'Comment can only be updated by the owner.'
                };

            const updatedComment = await Comment.findOneAndUpdate(
                { _id: commentId },
                { description },
                { new: true, populate: 'commentLikes' }
            );

            return {
                message: 'Your comment has been successfully updated.',
                comment: updatedComment
            };
        } catch (error) {
            return error;
        }
    },
    DeleteComment: async (commentId, user) => {
        try {
            const commentRecord = await Comment.findOne({
                _id: commentId,
                isDeleted: false
            }).lean();
            if (!commentRecord)
                throw {
                    message:
                        'Comment does not exist or may already been deleted.'
                };
            if (commentRecord.userId != user.id)
                throw {
                    message: 'Comment can only be deleted by the owner.'
                };

            const updatedComment = await Comment.findOneAndUpdate(
                { _id: commentId },
                { isDeleted: true },
                { new: true }
            );

            await PostService.PullComment(commentRecord.postId, commentId);

            return {
                message: 'Your comment has been successfully deleted.',
                comment: updatedComment
            };
        } catch (error) {
            return error;
        }
    },
    GetComment: async (postId, options) => {
        const { offset, numOfItems, before = moment() } = options;
        try {
            const postRecord = await Post.findOne({
                _id: postId,
                isDeleted: false
            }).lean();
            if (!postRecord)
                throw {
                    message: 'Post does not exist or may already been deleted.'
                };

            const commentRecords = await Comment.find({
                postId,
                isDeleted: false,
                createdAt: { $lte: before }
            })
                .sort('-createdAt')
                .skip(offset)
                .limit(numOfItems)
                .populate([
                    { path: 'userId', select: 'username fullname' },
                    {
                        path: 'commentLikes',
                        select: 'users count',
                        populate: {
                            path: 'users',
                            select: 'username fullname'
                        }
                    },
                    {
                        path: 'replies',
                        select: 'userId description replyLikes',
                        populate: [
                            {
                                path: 'userId',
                                select: 'username fullname'
                            },
                            {
                                path: 'replyLikes',
                                select: 'users count',
                                populate: {
                                    path: 'users',
                                    select: 'username fullname'
                                }
                            }
                        ],
                        options: { skip: 0, limit: 5 }
                    }
                ])
                .lean();

            return {
                comments: commentRecords
            };
        } catch (error) {
            return error;
        }
    },
    ViewComment: async (commentId) => {
        try {
            const commentRecord = await Comment.findOne({
                _id: commentId,
                isDeleted: false
            })
                .populate([
                    { path: 'userId', select: 'username fullname' },
                    {
                        path: 'commentLikes',
                        select: 'users count',
                        populate: {
                            path: 'users',
                            select: 'username fullname'
                        }
                    },
                    {
                        path: 'replies',
                        select: 'userId description replyLikes',
                        populate: [
                            {
                                path: 'userId',
                                select: 'username fullname'
                            },
                            {
                                path: 'replyLikes',
                                select: 'users count',
                                populate: {
                                    path: 'users',
                                    select: 'username fullname'
                                }
                            }
                        ],
                        options: { skip: 0, limit: 5 }
                    }
                ])
                .lean();

            if (!commentRecord)
                throw {
                    message:
                        'Comment does not exist or may already been deleted.'
                };

            return {
                comment: commentRecord
            };
        } catch (error) {
            return error;
        }
    },
    AddCommentLike: async (commentId, user) => {
        try {
            const commentRecord = await Comment.findOne({
                _id: commentId,
                isDeleted: false
            })
                .populate({ path: 'commentLikes', select: 'users count' })
                .lean();

            if (!commentRecord)
                throw {
                    message:
                        'Comment does not exist or may already been deleted.'
                };

            const userFound = commentRecord.commentLikes.users.find((u) => {
                return u == user.id;
            });

            if (userFound)
                throw { message: 'You have already liked this comment.' };

            const updatedCommentLike = await CommentLike.findOneAndUpdate(
                { commentId },
                { $push: { users: user.id }, $inc: { count: 1 } },
                { new: true }
            );

            return {
                message: 'You have successfully liked the comment.',
                commentLike: updatedCommentLike
            };
        } catch (error) {
            return error;
        }
    },
    RemoveCommentLike: async (commentId, user) => {
        try {
            const commentRecord = await Comment.findOne({
                _id: commentId,
                isDeleted: false
            })
                .populate({ path: 'commentLikes', select: 'users count' })
                .lean();

            if (!commentRecord)
                throw {
                    message:
                        'Comment does not exist or may already been deleted.'
                };

            const userFound = commentRecord.commentLikes.users.find((u) => {
                return u == user.id;
            });

            if (!userFound)
                throw { message: 'You have not liked this comment yet.' };

            const updatedCommentLike = await CommentLike.findOneAndUpdate(
                { commentId },
                { $pull: { users: user.id }, $inc: { count: -1 } },
                { new: true }
            );

            return {
                message: 'You have successfully unliked the comment.',
                commentLike: updatedCommentLike
            };
        } catch (error) {
            return error;
        }
    },
    PushReply: async (commentId, replyId) => {
        try {
            const updatedComment = await Comment.findOneAndUpdate(
                { _id: commentId },
                { $push: { replies: replyId } },
                { new: true }
            );

            return {
                comment: updatedComment
            };
        } catch (error) {
            return error;
        }
    },
    PullReply: async (commentId, replyId) => {
        try {
            const updatedComment = await Comment.findOneAndUpdate(
                { _id: commentId },
                { $pull: { replies: replyId } },
                { new: true }
            );

            return {
                comment: updatedComment
            };
        } catch (error) {
            return error;
        }
    }
};
