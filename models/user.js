const userSchema = new mongoose.Schema(
    {
        username: { type: String, default: '' },
        fullname: { type: String, default: '' },
        email: { type: String, default: '' },
        password: { type: String, default: '' }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('User', userSchema);
