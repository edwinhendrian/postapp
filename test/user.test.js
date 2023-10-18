import supertest from 'supertest';
import { web } from '../src/application/web.js';
import { logger } from '../src/application/logging.js';
import { createTestUser, getTestUser, removeTestUser } from './test-util.js';
import bcrypt from 'bcrypt';

describe('POST /api/users', function () {
    afterEach(async () => {
        await removeTestUser();
    });

    it('should can register new user', async () => {
        const result = await supertest(web).post('/api/users').send({
            username: 'test',
            email: 'test@gmail.com',
            password: 'rahasia',
            name: 'User Test'
        });

        expect(result.status).toBe(200);
        expect(result.body.data.id).toBeDefined();
        expect(result.body.data.username).toBe('test');
        expect(result.body.data.email).toBe('test@gmail.com');
        expect(result.body.data.name).toBe('User Test');
        expect(result.body.data.password).toBeUndefined();
    });

    it('should reject if request is invalid', async () => {
        const result = await supertest(web).post('/api/users').send({
            username: '',
            email: '',
            password: '',
            name: ''
        });

        expect(result.status).toBe(400);
        expect(result.body.errors).toBeDefined();
    });

    it('should reject if username already registered', async () => {
        let result = await supertest(web).post('/api/users').send({
            username: 'test',
            email: 'test@gmail.com',
            password: 'rahasia',
            name: 'User Test'
        });

        expect(result.status).toBe(200);
        expect(result.body.data.id).toBeDefined();
        expect(result.body.data.username).toBe('test');
        expect(result.body.data.email).toBe('test@gmail.com');
        expect(result.body.data.name).toBe('User Test');
        expect(result.body.data.password).toBeUndefined();

        result = await supertest(web).post('/api/users').send({
            username: 'test',
            email: 'test123@gmail.com',
            password: 'rahasia',
            name: 'User Test'
        });

        logger.info(result.body);

        expect(result.status).toBe(400);
        expect(result.body.errors).toBeDefined();
    });

    it('should reject if email already registered', async () => {
        let result = await supertest(web).post('/api/users').send({
            username: 'test',
            email: 'test@gmail.com',
            password: 'rahasia',
            name: 'User Test'
        });

        expect(result.status).toBe(200);
        expect(result.body.data.id).toBeDefined();
        expect(result.body.data.username).toBe('test');
        expect(result.body.data.email).toBe('test@gmail.com');
        expect(result.body.data.name).toBe('User Test');
        expect(result.body.data.password).toBeUndefined();

        result = await supertest(web).post('/api/users').send({
            username: 'test123',
            email: 'test@gmail.com',
            password: 'rahasia',
            name: 'User Test'
        });

        logger.info(result.body);

        expect(result.status).toBe(400);
        expect(result.body.errors).toBeDefined();
    });
});

describe('POST /api/users/login', function () {
    beforeEach(async () => {
        await createTestUser();
    });

    afterEach(async () => {
        await removeTestUser();
    });

    it('should can login', async () => {
        const result = await supertest(web).post('/api/users/login').send({
            username: 'test',
            password: 'rahasia'
        });

        logger.info(result.body);

        expect(result.status).toBe(200);
        expect(result.body.data.token).toBeDefined();
        expect(result.body.data.token).not.toBe('test-token');
    });

    it('should reject login if password wrong', async () => {
        const result = await supertest(web).post('/api/users/login').send({
            username: 'test',
            password: 'salah'
        });

        logger.info(result.body);

        expect(result.status).toBe(401);
        expect(result.body.errors).toBeDefined();
    });

    it('should reject login if username wrong', async () => {
        const result = await supertest(web).post('/api/users/login').send({
            username: 'salah',
            password: 'rahasia'
        });

        logger.info(result.body);

        expect(result.status).toBe(401);
        expect(result.body.errors).toBeDefined();
    });
});

describe('GET /api/users/current', function () {
    beforeEach(async () => {
        await createTestUser();
    });

    afterEach(async () => {
        await removeTestUser();
    });

    it('should can get current user', async () => {
        const result = await supertest(web)
            .get('/api/users/current')
            .set('Authorization', 'test-token');

        logger.info(result.body);

        expect(result.status).toBe(200);
        expect(result.body.data.id).toBeDefined();
        expect(result.body.data.username).toBe('test');
        expect(result.body.data.email).toBe('test@gmail.com');
        expect(result.body.data.name).toBe('User Test');
    });

    it('should reject if token is invalid', async () => {
        const result = await supertest(web)
            .get('/api/users/current')
            .set('Authorization', 'salah');

        logger.info(result.body);

        expect(result.status).toBe(401);
        expect(result.body.errors).toBeDefined();
    });
});

describe('PATCH /api/users/current', function () {
    beforeEach(async () => {
        await createTestUser();
    });

    afterEach(async () => {
        await removeTestUser();
    });

    it('should can update user data', async () => {
        const result = await supertest(web)
            .patch('/api/users/current')
            .set('Authorization', 'test-token')
            .send({
                username: 'testganti',
                email: 'testganti@gmail.com',
                password: 'rahasiaganti',
                name: 'Edwin Hendrian'
            });

        expect(result.status).toBe(200);
        expect(result.body.data.username).toBe('testganti');
        expect(result.body.data.email).toBe('testganti@gmail.com');
        expect(result.body.data.name).toBe('Edwin Hendrian');

        const user = await getTestUser();
        expect(await bcrypt.compare('rahasiaganti', user.password)).toBe(true);
    });

    it(`should can update user's username`, async () => {
        const result = await supertest(web)
            .patch('/api/users/current')
            .set('Authorization', 'test-token')
            .send({
                username: 'testganti'
            });

        expect(result.status).toBe(200);
        expect(result.body.data.username).toBe('testganti');
        expect(result.body.data.email).toBe('test@gmail.com');
        expect(result.body.data.name).toBe('User Test');
    });

    it(`should can update user's email`, async () => {
        const result = await supertest(web)
            .patch('/api/users/current')
            .set('Authorization', 'test-token')
            .send({
                email: 'testganti@gmail.com'
            });

        expect(result.status).toBe(200);
        expect(result.body.data.username).toBe('test');
        expect(result.body.data.email).toBe('testganti@gmail.com');
        expect(result.body.data.name).toBe('User Test');
    });

    it(`should can update user's name`, async () => {
        const result = await supertest(web)
            .patch('/api/users/current')
            .set('Authorization', 'test-token')
            .send({
                name: 'Edwin Hendrian'
            });

        expect(result.status).toBe(200);
        expect(result.body.data.username).toBe('test');
        expect(result.body.data.email).toBe('test@gmail.com');
        expect(result.body.data.name).toBe('Edwin Hendrian');
    });

    it(`should can update user's password`, async () => {
        const result = await supertest(web)
            .patch('/api/users/current')
            .set('Authorization', 'test-token')
            .send({
                password: 'gantirahasia'
            });

        expect(result.status).toBe(200);
        expect(result.body.data.username).toBe('test');
        expect(result.body.data.email).toBe('test@gmail.com');
        expect(result.body.data.name).toBe('User Test');

        const user = await getTestUser();
        expect(await bcrypt.compare('gantirahasia', user.password)).toBe(true);
    });

    it('should reject if request is invalid', async () => {
        const result = await supertest(web)
            .patch('/api/users/current')
            .set('Authorization', 'salah')
            .send({});

        expect(result.status).toBe(401);
        expect(result.body.errors).toBeDefined();
    });
});

describe('DELETE /api/users/logout', function () {
    beforeEach(async () => {
        await createTestUser();
    });

    afterEach(async () => {
        await removeTestUser();
    });

    it('should can logout', async () => {
        const result = await supertest(web)
            .delete('/api/users/logout')
            .set('Authorization', 'test-token');

        expect(result.status).toBe(200);
        expect(result.body.data).toBe('OK');

        const user = await getTestUser();
        expect(user.token).toBeNull();
    });

    it('should reject if request is invalid', async () => {
        const result = await supertest(web)
            .delete('/api/users/logout')
            .set('Authorization', 'salah');

        expect(result.status).toBe(401);
        expect(result.body.errors).toBeDefined();
    });
});
