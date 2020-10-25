const { ObjectId } = mongoose.SchemaTypes;

const fileSchema = new mongoose.Schema(
    {
        postId: { type: ObjectId, ref: 'Post', default: null },
        filename: { type: String, default: null },
        meta: { type: Object, default: null }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('File', fileSchema);
