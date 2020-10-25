const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const { accessTokenSecret } = require('../config');

const UserService = require('../services/user');

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, accessTokenSecret, (err, user) => {
            if (err) return res.sendStatus(403);

            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

router.post('/register', async (req, res, next) => {
    const userData = req.body;

    const result = await UserService.SignUp(userData);

    return res.json(result);
});

router.post('/login', async (req, res, next) => {
    const userData = req.body;

    const result = await UserService.SignIn(userData);

    return res.json(result);
});

router.post('/token', async (req, res, next) => {
    const { token } = req.body;

    if (!token) return res.sendStatus(401);

    const result = await UserService.Token(token);

    return res.json(result);
});

module.exports = router;
