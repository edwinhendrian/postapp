const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const { accessTokenSecret } = require('../../config');

const CommentService = require('../../services/comment');
const ReplyService = require('../../services/reply');

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

    if (result.error)
        return res.status(400).send({ status: 400, error: result.error });
    else
        return res.json({
            status: 200,
            data: result
        });
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

    if (result.error)
        return res.status(400).send({ status: 400, error: result.error });
    else
        return res.json({
            status: 200,
            data: result
        });
});

router.delete('/:commentId', authenticateJWT, async (req, res, next) => {
    const { commentId } = req.params;
    const user = req.user;

    const result = await CommentService.DeleteComment(commentId, user);

    if (result.error)
        return res.status(400).send({ status: 400, error: result.error });
    else
        return res.json({
            status: 200,
            data: result
        });
});

router.get('/:commentId', authenticateJWT, async (req, res, next) => {
    const { commentId } = req.params;

    const result = await CommentService.ViewComment(commentId);

    if (result.error)
        return res.status(400).send({ status: 400, error: result.error });
    else
        return res.json({
            status: 200,
            data: result
        });
});

// Reply
router.get('/:commentId/reply', authenticateJWT, async (req, res, next) => {
    const { commentId } = req.params;
    const options = req.body;

    const result = await ReplyService.GetReply(commentId, options);

    if (result.error)
        return res.status(400).send({ status: 400, error: result.error });
    else
        return res.json({
            status: 200,
            data: result
        });
});

// CommentLike
router.post('/like', authenticateJWT, async (req, res, next) => {
    const { commentId } = req.body;
    const user = req.user;

    const result = await CommentService.AddCommentLike(commentId, user);

    if (result.error)
        return res.status(400).send({ status: 400, error: result.error });
    else
        return res.json({
            status: 200,
            data: result
        });
});

router.post('/unlike', authenticateJWT, async (req, res, next) => {
    const { commentId } = req.body;
    const user = req.user;

    const result = await CommentService.RemoveCommentLike(commentId, user);

    if (result.error)
        return res.status(400).send({ status: 400, error: result.error });
    else
        return res.json({
            status: 200,
            data: result
        });
});

module.exports = router;
