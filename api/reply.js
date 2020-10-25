const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const { accessTokenSecret } = require('../config');

const ReplyService = require('../services/reply');

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

// Reply
router.post('/', authenticateJWT, async (req, res, next) => {
    const replyData = req.body;
    const user = req.user;

    const result = await ReplyService.AddReply(replyData, user);

    return res.json(result);
});

router.patch('/:replyId', authenticateJWT, async (req, res, next) => {
    const { replyId } = req.params;
    const { description } = req.body;
    const user = req.user;

    const result = await ReplyService.UpdateReply(replyId, description, user);

    return res.json(result);
});

router.delete('/:replyId', authenticateJWT, async (req, res, next) => {
    const { replyId } = req.params;
    const user = req.user;

    const result = await ReplyService.DeleteReply(replyId, user);

    return res.json(result);
});

router.get('/:replyId', authenticateJWT, async (req, res, next) => {
    const { replyId } = req.params;

    const result = await ReplyService.ViewReply(replyId);

    return res.json(result);
});

// ReplyLike
router.post('/like', authenticateJWT, async (req, res, next) => {
    const { replyId } = req.body;
    const user = req.user;

    const result = await ReplyService.AddReplyLike(replyId, user);

    return res.json(result);
});

router.post('/unlike', authenticateJWT, async (req, res, next) => {
    const { replyId } = req.body;
    const user = req.user;

    const result = await ReplyService.RemoveReplyLike(replyId, user);

    return res.json(result);
});

module.exports = router;
