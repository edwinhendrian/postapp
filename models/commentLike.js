const { ObjectId } = mongoose.SchemaTypes;

const commentLikeSchema = new mongoose.Schema(
    {
        commentId: { type: ObjectId, ref: 'Comment', default: null },
        users: [{ type: ObjectId, ref: 'User', default: null }],
        count: { type: Number, default: 0 }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('CommentLike', commentLikeSchema);
