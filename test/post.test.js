import supertest from 'supertest';
import { web } from '../src/application/web.js';
import { logger } from '../src/application/logging.js';
import {
    createTestLike,
    createTestPost,
    createTestReply,
    createTestUser,
    createTestUser2,
    getTestPost,
    getTestUser,
    removeTestLike,
    removeTestPost,
    removeTestUser,
    updateTestPost
} from './test-util.js';

describe('POST /api/posts', function () {
    beforeEach(async () => {
        await createTestUser();
    });

    afterEach(async () => {
        await removeTestPost();
        await removeTestUser();
    });

    it('should can create new post', async () => {
        const result = await supertest(web)
            .post('/api/posts')
            .set('Authorization', 'test-token')
            .send({
                text: 'test post'
            });

        logger.info(result);

        expect(result.status).toBe(200);
        expect(result.body.data.id).toBeDefined();
        expect(result.body.data.text).toBe('test post');
        expect(result.body.data.reply_count).toBe(0);
        expect(result.body.data.like_count).toBe(0);
        expect(result.body.data.user).toBeDefined();
        expect(result.body.data.created_at).toBeDefined();
        expect(result.body.data.updated_at).toBeDefined();
    });

    it('should reject if request is invalid', async () => {
        const result = await supertest(web)
            .post('/api/posts')
            .set('Authorization', 'test-token')
            .send({
                text: ''
            });

        expect(result.status).toBe(400);
        expect(result.body.errors).toBeDefined();
    });

    it('should reject if text more than 140 characters', async () => {
        const result = await supertest(web)
            .post('/api/posts')
            .set('Authorization', 'test-token')
            .send({
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
            });

        expect(result.status).toBe(400);
        expect(result.body.errors).toBeDefined();
    });
});

describe('GET /api/posts/:post_id', function () {
    beforeEach(async () => {
        await createTestUser();
        await createTestPost((await getTestUser()).id);
    });

    afterEach(async () => {
        await removeTestPost();
        await removeTestUser();
    });

    it('should can get post', async () => {
        const post = await getTestPost();
        const result = await supertest(web)
            .get(`/api/posts/${post.id}`)
            .set('Authorization', 'test-token');

        expect(result.status).toBe(200);
        expect(result.body.data.id).toBeDefined();
        expect(result.body.data.text).toBe('test post');
        expect(result.body.data.post).toBeDefined();
        expect(result.body.data.replies).toBeDefined();
        expect(result.body.data.reply_count).toBe(0);
        expect(result.body.data.like_count).toBe(0);
        expect(result.body.data.user).toBeDefined();
        expect(result.body.data.created_at).toBeDefined();
        expect(result.body.data.updated_at).toBeDefined();
    });

    it('should reject if post not found', async () => {
        const result = await supertest(web)
            .get(`/api/posts/0`)
            .set('Authorization', 'test-token');

        logger.info(result.body);

        expect(result.status).toBe(404);
        expect(result.body.errors).toBeDefined();
    });

    it('should reject if token is invalid', async () => {
        const post = await getTestPost();
        const result = await supertest(web)
            .get(`/api/posts/${post.id}`)
            .set('Authorization', 'salah');

        logger.info(result.body);

        expect(result.status).toBe(401);
        expect(result.body.errors).toBeDefined();
    });
});

describe('POST /api/posts/:post_id', function () {
    beforeEach(async () => {
        await createTestUser();
        await createTestPost((await getTestUser()).id);
    });

    afterEach(async () => {
        await removeTestPost();
        await removeTestUser();
    });

    it('should can create new reply post', async () => {
        const post = await getTestPost();
        const result = await supertest(web)
            .post(`/api/posts/${post.id}`)
            .set('Authorization', 'test-token')
            .send({
                text: 'test reply'
            });

        logger.info(result);

        expect(result.status).toBe(200);
        expect(result.body.data.id).toBeDefined();
        expect(result.body.data.text).toBe('test reply');
        expect(result.body.data.post_id).toBeDefined();
        expect(result.body.data.reply_count).toBe(0);
        expect(result.body.data.like_count).toBe(0);
        expect(result.body.data.user).toBeDefined();
        expect(result.body.data.created_at).toBeDefined();
        expect(result.body.data.updated_at).toBeDefined();
    });

    it('should reject if request is invalid', async () => {
        const post = await getTestPost();
        const result = await supertest(web)
            .post(`/api/posts/${post.id}`)
            .set('Authorization', 'test-token')
            .send({
                text: ''
            });

        expect(result.status).toBe(400);
        expect(result.body.errors).toBeDefined();
    });

    it('should reject if post is not found', async () => {
        const result = await supertest(web)
            .post('/api/posts/0')
            .set('Authorization', 'test-token')
            .send({
                text: 'test reply'
            });

        expect(result.status).toBe(404);
        expect(result.body.errors).toBeDefined();
    });

    it('should reject if text more than 140 characters', async () => {
        const post = await getTestPost();
        const result = await supertest(web)
            .post(`/api/posts/${post.id}`)
            .set('Authorization', 'test-token')
            .send({
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
            });

        expect(result.status).toBe(400);
        expect(result.body.errors).toBeDefined();
    });
});

describe('DELETE /api/posts/:post_id', function () {
    beforeEach(async () => {
        await createTestUser();
        await createTestPost((await getTestUser()).id);
    });

    afterEach(async () => {
        await removeTestPost();
        await removeTestUser();
    });

    it('should can delete post', async () => {
        const post = await getTestPost();

        expect(post.id).toBeDefined();
        expect(post.text).toBe('test post');

        const result = await supertest(web)
            .delete(`/api/posts/${post.id}`)
            .set('Authorization', 'test-token');

        expect(result.status).toBe(200);
        expect(result.body.data).toBe('OK');
    });

    it('should reject if post is not found', async () => {
        const result = await supertest(web)
            .delete('/api/posts/0')
            .set('Authorization', 'test-token');

        expect(result.status).toBe(404);
        expect(result.body.errors).toBeDefined();
    });

    it('should reject if post not yours', async () => {
        await createTestUser2();

        const post = await getTestPost();
        const result = await supertest(web)
            .delete(`/api/posts/${post.id}`)
            .set('Authorization', 'test-token-2');

        expect(result.status).toBe(401);
        expect(result.body.errors).toBeDefined();
    });
});

describe('GET /api/posts/:post_id/like', function () {
    beforeEach(async () => {
        await createTestUser();
        await createTestPost((await getTestUser()).id);
    });

    afterEach(async () => {
        await removeTestLike(
            (
                await getTestPost()
            ).id,
            (
                await getTestUser()
            ).id
        );
        await removeTestPost();
        await removeTestUser();
    });

    it('should can like a post', async () => {
        const post = await getTestPost();
        expect(post.like_count).toBe(0);

        const result = await supertest(web)
            .get(`/api/posts/${post.id}/like`)
            .set('Authorization', 'test-token');

        const postAfter = await getTestPost();
        expect(postAfter.like_count).toBe(1);
        expect(result.status).toBe(200);
    });

    it('should reject if post is not found', async () => {
        const result = await supertest(web)
            .get('/api/posts/0/like')
            .set('Authorization', 'test-token');

        expect(result.status).toBe(404);
        expect(result.body.errors).toBeDefined();
    });

    it('should reject if already like the post', async () => {
        const post = await getTestPost();
        await supertest(web)
            .get(`/api/posts/${post.id}/like`)
            .set('Authorization', 'test-token');

        const result = await supertest(web)
            .get(`/api/posts/${post.id}/like`)
            .set('Authorization', 'test-token');

        expect(result.status).toBe(400);
        expect(result.body.errors).toBeDefined();
    });
});

describe('DELETE /api/posts/:post_id/unlike', function () {
    beforeEach(async () => {
        await createTestUser();
        const user_id = (await getTestUser()).id;
        await createTestPost(user_id);
        const post_id = (await getTestPost()).id;
        await updateTestPost(post_id, {
            like_count: { increment: 1 }
        });
        await createTestLike(post_id, user_id);
    });

    afterEach(async () => {
        await removeTestLike(
            (
                await getTestPost()
            ).id,
            (
                await getTestUser()
            ).id
        );
        await removeTestPost();
        await removeTestUser();
    });

    it('should can unlike a post', async () => {
        const post = await getTestPost();
        expect(post.like_count).toBe(1);

        const result = await supertest(web)
            .delete(`/api/posts/${post.id}/unlike`)
            .set('Authorization', 'test-token');

        const postAfter = await getTestPost();
        expect(postAfter.like_count).toBe(0);
        expect(result.status).toBe(200);
    });

    it('should reject if post is not found', async () => {
        const result = await supertest(web)
            .delete('/api/posts/0/unlike')
            .set('Authorization', 'test-token');

        expect(result.status).toBe(404);
        expect(result.body.errors).toBeDefined();
    });

    it('should reject if have not like the post', async () => {
        const post = await getTestPost();
        await supertest(web)
            .delete(`/api/posts/${post.id}/unlike`)
            .set('Authorization', 'test-token');

        const result = await supertest(web)
            .delete(`/api/posts/${post.id}/unlike`)
            .set('Authorization', 'test-token');

        expect(result.status).toBe(400);
        expect(result.body.errors).toBeDefined();
    });
});

describe('GET /api/users/:user_id/posts', function () {
    beforeEach(async () => {
        await createTestUser();
        const user = await getTestUser();
        await createTestPost(user.id);
        const post = await getTestPost();
        await createTestReply(post.id, user.id);
    });

    afterEach(async () => {
        await removeTestPost();
        await removeTestUser();
    });

    it(`should can get all user's post`, async () => {
        const user = await getTestUser();
        const result = await supertest(web)
            .get(`/api/users/${user.id}/posts`)
            .set('Authorization', 'test-token');

        expect(result.status).toBe(200);
        expect(result.body.data).toBeDefined();
    });

    it('should reject if token is invalid', async () => {
        const user = await getTestUser();
        const result = await supertest(web)
            .get(`/api/users/${user.id}/posts`)
            .set('Authorization', 'salah');

        expect(result.status).toBe(401);
        expect(result.body.errors).toBeDefined();
    });
});

describe('GET /api/users/:user_id/replies', function () {
    beforeEach(async () => {
        await createTestUser();
        const user = await getTestUser();
        await createTestPost(user.id);
        const post = await getTestPost();
        await createTestReply(post.id, user.id);
    });

    afterEach(async () => {
        await removeTestPost();
        await removeTestUser();
    });

    it(`should can get all user's replies`, async () => {
        const user = await getTestUser();
        const result = await supertest(web)
            .get(`/api/users/${user.id}/replies`)
            .set('Authorization', 'test-token');

        expect(result.status).toBe(200);
        expect(result.body.data).toBeDefined();
    });

    it('should reject if token is invalid', async () => {
        const user = await getTestUser();
        const result = await supertest(web)
            .get(`/api/users/${user.id}/replies`)
            .set('Authorization', 'salah');

        expect(result.status).toBe(401);
        expect(result.body.errors).toBeDefined();
    });
});
