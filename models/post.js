const { ObjectId } = mongoose.SchemaTypes;

const postSchema = new mongoose.Schema(
    {
        userId: { type: ObjectId, ref: 'User', default: null },
        file: { type: ObjectId, ref: 'File', default: null },
        description: { type: String, default: '' },
        likes: { type: ObjectId, ref: 'Like', default: null },
        comments: [{ type: ObjectId, ref: 'Comment', default: null }],
        isDeleted: { type: Boolean, default: false }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Post', postSchema);
