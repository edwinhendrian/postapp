const moment = require('moment');

const CommentService = require('./comment');

const Comment = require('../models/comment');
const Reply = require('../models/reply');
const ReplyLike = require('../models/replyLike');

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
                    message:
                        'Comment does not exist or may already been deleted.'
                };

            const newReplyEntry = await Reply.create({
                userId: user.id,
                commentId,
                description
            });

            const replyLikeEntry = await ReplyLike.create({
                replyId: newReplyEntry._id
            });

            await CommentService.PushReply(commentId, newReplyEntry._id);

            const newUpdatedReply = await Reply.findOneAndUpdate(
                {
                    _id: newReplyEntry._id
                },
                { replyLikes: replyLikeEntry._id },
                { new: true }
            );

            console.log(newUpdatedReply);

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
            const replyRecord = await Reply.findOne({
                _id: replyId,
                isDeleted: false
            }).lean();
            if (!replyRecord)
                throw {
                    message: 'Reply does not exist or may already been deleted.'
                };
            if (replyRecord.userId != user.id)
                throw {
                    message: 'Reply can only be updated by the owner.'
                };

            const updatedReply = await Reply.findOneAndUpdate(
                { _id: replyId },
                { description },
                { new: true, populate: 'replyLikes' }
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
            const replyRecord = await Reply.findOne({
                _id: replyId,
                isDeleted: false
            }).lean();
            if (!replyRecord)
                throw {
                    message: 'Reply does not exist or may already been deleted.'
                };
            if (replyRecord.userId != user.id)
                throw {
                    message: 'Reply can only be deleted by the owner.'
                };

            const updatedReply = await Reply.findOneAndUpdate(
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
                    message:
                        'Comment does not exist or may already been deleted.'
                };

            const replyRecords = await Reply.find({
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
                        path: 'replyLikes',
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
            const replyRecord = await Reply.findOne({
                _id: replyId,
                isDeleted: false
            })
                .populate([
                    { path: 'userId', select: 'username fullname' },
                    {
                        path: 'replyLikes',
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
                    message: 'Reply does not exist or may already been deleted.'
                };

            return {
                reply: replyRecord
            };
        } catch (error) {
            return error;
        }
    },
    AddReplyLike: async (replyId, user) => {
        try {
            const replyRecord = await Reply.findOne({
                _id: replyId,
                isDeleted: false
            })
                .populate({ path: 'replyLikes', select: 'users count' })
                .lean();

            if (!replyRecord)
                throw {
                    message: 'Reply does not exist or may already been deleted.'
                };

            const userFound = replyRecord.replyLikes.users.find((u) => {
                return u == user.id;
            });

            if (userFound)
                throw { message: 'You have already liked this reply.' };

            const updatedReplyLike = await ReplyLike.findOneAndUpdate(
                { replyId },
                { $push: { users: user.id }, $inc: { count: 1 } },
                { new: true }
            );

            return {
                message: 'You have successfully liked the reply.',
                replyLike: updatedReplyLike
            };
        } catch (error) {
            return error;
        }
    },
    RemoveReplyLike: async (replyId, user) => {
        try {
            const replyRecord = await Reply.findOne({
                _id: replyId,
                isDeleted: false
            })
                .populate({ path: 'replyLikes', select: 'users count' })
                .lean();

            if (!replyRecord)
                throw {
                    message: 'Reply does not exist or may already been deleted.'
                };

            const userFound = replyRecord.replyLikes.users.find((u) => {
                return u == user.id;
            });

            if (!userFound)
                throw { message: 'You have not liked this reply yet.' };

            const updatedReplyLike = await ReplyLike.findOneAndUpdate(
                { replyId },
                { $pull: { users: user.id }, $inc: { count: -1 } },
                { new: true }
            );

            return {
                message: 'You have successfully unliked the reply.',
                replyLike: updatedReplyLike
            };
        } catch (error) {
            return error;
        }
    }
};
