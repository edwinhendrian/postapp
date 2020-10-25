const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { accessTokenSecret, refreshTokenSecret } = require('../config');

const User = require('../models/user');

async function hashPassword(password) {
    return new Promise((resolve, reject) => {
        const salt = crypto.randomBytes(8).toString('hex');

        crypto.scrypt(password, salt, 64, (err, key) => {
            if (err) reject(err);
            resolve(salt + ':' + key.toString('hex'));
        });
    });
}

async function verifyPassword(password, hash) {
    return new Promise((resolve, reject) => {
        const [salt, hashKey] = hash.split(':');
        crypto.scrypt(password, salt, 64, (err, key) => {
            if (err) reject(err);
            resolve(hashKey == key.toString('hex'));
        });
    });
}

function generateToken(data, tokenSecret, options = {}) {
    return jwt.sign(data, tokenSecret, options);
}

module.exports = {
    SignUp: async (userData) => {
        const {
            username, //
            fullname,
            email,
            password1,
            password2
        } = userData;
        try {
            const userRecord = await User.findOne({
                $or: [{ username }, { email }]
            });
            if (userRecord)
                throw { message: 'Error! Username or Email already in used.' };
            if (password1 != password2)
                throw { message: 'Error! Passwords do not match.' };
            const password = await hashPassword(password1);

            const newUserEntry = await User.create({
                username,
                fullname,
                email,
                password
            });
            return {
                message: 'Your account has been successfully created.',
                user: newUserEntry
            };
        } catch (error) {
            return error;
        }
    },
    SignIn: async (userData) => {
        const { username, password } = userData;
        try {
            const userRecord = await User.findOne({ username });
            const passwordCheck = await verifyPassword(
                password,
                userRecord.password
            );
            if (!userRecord || !passwordCheck)
                throw { message: 'Error! Incorrect username or password.' };

            const accessToken = generateToken(
                {
                    id: userRecord._id,
                    username: userRecord.username,
                    fullname: userRecord.fullname,
                    email: userRecord.email
                },
                accessTokenSecret,
                { expiresIn: '1h' }
            );
            const refreshToken = generateToken(
                {
                    id: userRecord._id,
                    username: userRecord.username,
                    fullname: userRecord.fullname,
                    email: userRecord.email
                },
                refreshTokenSecret
            );

            return {
                message: 'You have successfully logged in.',
                user: userRecord,
                accessToken,
                refreshToken
            };
        } catch (error) {
            return error;
        }
    },
    Token: async (token) => {
        try {
            const verify = jwt.verify(
                token,
                refreshTokenSecret,
                (err, user) => {
                    if (err) throw { message: 'Invalid Token.' };
                    return user;
                }
            );

            const userRecord = await User.findOne({
                username: verify.username
            });
            if (!userRecord) throw { message: 'Invalid Token.' };

            return {
                accessToken: generateToken(
                    {
                        id: userRecord._id,
                        username: userRecord.username,
                        fullname: userRecord.fullname,
                        email: userRecord.email
                    },
                    accessTokenSecret,
                    { expiresIn: '1h' }
                )
            };
        } catch (error) {
            return error;
        }
    }
};
