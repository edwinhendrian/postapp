const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const { accessTokenSecret } = require('../config');

const CommentService = require('../services/comment');
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

// Comment
router.post('/', authenticateJWT, async (req, res, next) => {
    const commentData = req.body;
    const user = req.user;

    const result = await CommentService.AddComment(commentData, user);

    return res.json(result);
});

router.patch('/:commentId', authenticateJWT, async (req, res, next) => {
    const { commentId } = req.params;
    const { description } = req.body;
    const user = req.user;

    const result = await CommentService.UpdateComment(
        commentId,
        description,
        user
    );

    return res.json(result);
});

router.delete('/:commentId', authenticateJWT, async (req, res, next) => {
    const { commentId } = req.params;
    const user = req.user;

    const result = await CommentService.DeleteComment(commentId, user);

    return res.json(result);
});

router.get('/:commentId', authenticateJWT, async (req, res, next) => {
    const { commentId } = req.params;

    const result = await CommentService.ViewComment(commentId);

    return res.json(result);
});

// Reply
router.get('/:commentId/reply', authenticateJWT, async (req, res, next) => {
    const { commentId } = req.params;
    const options = req.body;

    const result = await ReplyService.GetReply(commentId, options);

    return res.json(result);
});

// CommentLike
router.post('/like', authenticateJWT, async (req, res, next) => {
    const { commentId } = req.body;
    const user = req.user;

    const result = await CommentService.AddCommentLike(commentId, user);

    return res.json(result);
});

router.post('/unlike', authenticateJWT, async (req, res, next) => {
    const { commentId } = req.body;
    const user = req.user;

    const result = await CommentService.RemoveCommentLike(commentId, user);

    return res.json(result);
});

module.exports = router;
