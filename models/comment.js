const { ObjectId } = mongoose.SchemaTypes;

const commentSchema = new mongoose.Schema(
    {
        userId: { type: ObjectId, ref: 'User', default: null },
        postId: { type: ObjectId, ref: 'Post', default: null },
        commentId: { type: ObjectId, ref: 'Comment', default: null },
        description: { type: String, default: '' },
        commentLikes: { type: ObjectId, ref: 'CommentLike', default: null },
        replies: [{ type: ObjectId, ref: 'Comment', default: null }],
        isDeleted: { type: Boolean, default: false }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Comment', commentSchema);
