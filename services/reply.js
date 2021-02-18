const moment = require('moment');

const CommentService = require('./comment');

const Comment = require('../models/comment');
const CommentLike = require('../models/commentLike');

module.exports = {
    AddReply: async (replyData, user) => {
        const { commentId, description } = replyData;
        try {
            const commentRecord = await Comment.findOne({
                _id: commentId,
                isDeleted: false
            }).lean();
            if (!commentRecord)
                throw {
                    error: 'Comment does not exist or may already been deleted.'
                };

            const newReplyEntry = await Comment.create({
                userId: user.id,
                commentId,
                description
            });

            const replyLikeEntry = await CommentLike.create({
                commentId: newReplyEntry._id
            });

            await CommentService.PushReply(commentId, newReplyEntry._id);

            const newUpdatedReply = await Comment.findOneAndUpdate(
                {
                    _id: newReplyEntry._id
                },
                { commentLikes: replyLikeEntry._id },
                { new: true }
            );

            return {
                message: 'Your reply has been successfully uploaded.',
                reply: newUpdatedReply
            };
        } catch (error) {
            return error;
        }
    },
    UpdateReply: async (replyId, description, user) => {
        try {
            const replyRecord = await Comment.findOne({
                _id: replyId,
                commentId: { $ne: null },
                isDeleted: false
            }).lean();
            if (!replyRecord)
                throw {
                    error: 'Reply does not exist or may already been deleted.'
                };
            if (replyRecord.userId != user.id)
                throw {
                    error: 'Reply can only be updated by the owner.'
                };

            const updatedReply = await Comment.findOneAndUpdate(
                { _id: replyId },
                { description },
                { new: true, populate: 'commentLikes' }
            );

            return {
                message: 'Your reply has been successfully updated.',
                reply: updatedReply
            };
        } catch (error) {
            return error;
        }
    },
    DeleteReply: async (replyId, user) => {
        try {
            const replyRecord = await Comment.findOne({
                _id: replyId,
                commentId: { $ne: null },
                isDeleted: false
            }).lean();
            if (!replyRecord)
                throw {
                    error: 'Reply does not exist or may already been deleted.'
                };
            if (replyRecord.userId != user.id)
                throw {
                    error: 'Reply can only be deleted by the owner.'
                };

            const updatedReply = await Comment.findOneAndUpdate(
                { _id: replyId },
                { isDeleted: true },
                { new: true }
            );

            await CommentService.PullReply(replyRecord.commentId, replyId);

            return {
                message: 'Your reply has been successfully deleted.',
                reply: updatedReply
            };
        } catch (error) {
            return error;
        }
    },
    GetReply: async (commentId, options) => {
        const { offset, numOfItems, before = moment() } = options;
        try {
            const commentRecord = await Comment.findOne({
                _id: commentId,
                isDeleted: false
            }).lean();
            if (!commentRecord)
                throw {
                    error: 'Comment does not exist or may already been deleted.'
                };

            const replyRecords = await Comment.find({
                commentId,
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
                    }
                ])
                .lean();

            return {
                replys: replyRecords
            };
        } catch (error) {
            return error;
        }
    },
    ViewReply: async (replyId) => {
        try {
            const replyRecord = await Comment.findOne({
                _id: replyId,
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
                    }
                ])
                .lean();

            if (!replyRecord)
                throw {
                    error: 'Reply does not exist or may already been deleted.'
                };

            return {
                reply: replyRecord
            };
        } catch (error) {
            return error;
        }
    }
};
