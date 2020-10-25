const { ObjectId } = mongoose.SchemaTypes;

const replySchema = new mongoose.Schema(
    {
        userId: { type: ObjectId, ref: 'User', default: null },
        commentId: { type: ObjectId, ref: 'Comment', default: null },
        description: { type: String, default: '' },
        replyLikes: { type: ObjectId, ref: 'ReplyLike', default: null },
        isDeleted: { type: Boolean, default: false }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Reply', replySchema);
