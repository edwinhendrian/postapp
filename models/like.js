const { ObjectId } = mongoose.SchemaTypes;

const likeSchema = new mongoose.Schema(
    {
        postId: { type: ObjectId, ref: 'Post', default: null },
        users: [{ type: ObjectId, ref: 'User', default: null }],
        count: { type: Number, default: 0 }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Like', likeSchema);
