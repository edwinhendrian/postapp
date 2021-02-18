const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { accessTokenSecret } = require('../../config');

const CommentService = require('../../services/comment');
const PostService = require('../../services/post');

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

const diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: function (req, file, cb) {
        const { user } = req;
        cb(
            null,
            user.id.toString() +
                '_' +
                Date.now() +
                path.extname(file.originalname)
        );
    }
});

// Post
router.post(
    '/',
    authenticateJWT,
    multer({ storage: diskStorage }).single('file'),
    async (req, res, next) => {
        const file = req.file;
        const { description } = req.body;
        const user = req.user;

        const result = await PostService.AddPost(file, description, user);

        if (result.error)
            return res.status(400).send({ status: 400, error: result.error });
        else
            return res.json({
                status: 200,
                data: result
            });
    }
);

router.patch('/:postId', authenticateJWT, async (req, res, next) => {
    const { postId } = req.params;
    const { description } = req.body;
    const user = req.user;

    const result = await PostService.UpdatePost(postId, description, user);

    if (result.error)
        return res.status(400).send({ status: 400, error: result.error });
    else
        return res.json({
            status: 200,
            data: result
        });
});

router.delete('/:postId', authenticateJWT, async (req, res, next) => {
    const { postId } = req.params;
    const user = req.user;

    const result = await PostService.DeletePost(postId, user);

    if (result.error)
        return res.status(400).send({ status: 400, error: result.error });
    else
        return res.json({
            status: 200,
            data: result
        });
});

router.get('/', authenticateJWT, async (req, res, next) => {
    const options = req.body;

    const result = await PostService.GetPost(options);

    if (result.error)
        return res.status(400).send({ status: 400, error: result.error });
    else
        return res.json({
            status: 200,
            data: result
        });
});

router.get('/:postId', authenticateJWT, async (req, res, next) => {
    const { postId } = req.params;

    const result = await PostService.ViewPost(postId);

    if (result.error)
        return res.status(400).send({ status: 400, error: result.error });
    else
        return res.json({
            status: 200,
            data: result
        });
});

// Comment
router.get('/:postId/comment', authenticateJWT, async (req, res, next) => {
    const { postId } = req.params;
    const options = req.body;

    const result = await CommentService.GetComment(postId, options);

    if (result.error)
        return res.status(400).send({ status: 400, error: result.error });
    else
        return res.json({
            status: 200,
            data: result
        });
});

// Like
router.post('/like', authenticateJWT, async (req, res, next) => {
    const { postId } = req.body;
    const user = req.user;

    const result = await PostService.AddLike(postId, user);

    if (result.error)
        return res.status(400).send({ status: 400, error: result.error });
    else
        return res.json({
            status: 200,
            data: result
        });
});

router.post('/unlike', authenticateJWT, async (req, res, next) => {
    const { postId } = req.body;
    const user = req.user;

    const result = await PostService.RemoveLike(postId, user);

    if (result.error)
        return res.status(400).send({ status: 400, error: result.error });
    else
        return res.json({
            status: 200,
            data: result
        });
});

module.exports = router;
