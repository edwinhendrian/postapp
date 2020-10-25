const dotenv = require('dotenv');

const envFound = dotenv.config();
if (envFound.error) {
    throw new Error('.env file is missing');
}

module.exports = {
    port: process.env.PORT || 3000,
    mongoUrl: process.env.MONGO_URL,
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET
};
