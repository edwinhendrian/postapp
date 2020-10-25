const { ObjectId } = mongoose.SchemaTypes;

const replyLikeSchema = new mongoose.Schema(
    {
        replyId: { type: ObjectId, ref: 'Reply', default: null },
        users: [{ type: ObjectId, ref: 'User', default: null }],
        count: { type: Number, default: 0 }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('ReplyLike', replyLikeSchema);
