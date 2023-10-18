import express from 'express';
import postController from '../controller/post-controller.js';
import userController from '../controller/user-controller.js';
import { authMiddleware } from '../middleware/auth-middleware.js';

const apiRouter = new express.Router();
apiRouter.use(authMiddleware);

apiRouter.get('/api/users/current', userController.get);
apiRouter.patch('/api/users/current', userController.update);
apiRouter.delete('/api/users/logout', userController.logout);

apiRouter.get('/api/users/:user_id/posts', postController.getAllByUserId);
apiRouter.get(
    '/api/users/:user_id/replies',
    postController.getAllReplyByUserId
);

apiRouter.post('/api/posts', postController.create);
apiRouter.get('/api/posts/:post_id', postController.get);
apiRouter.post('/api/posts/:post_id', postController.reply);
apiRouter.delete('/api/posts/:post_id', postController.remove);
apiRouter.get('/api/posts/:post_id/like', postController.like);
apiRouter.delete('/api/posts/:post_id/unlike', postController.unlike);

export { apiRouter };
