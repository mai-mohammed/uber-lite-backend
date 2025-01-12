import request from 'supertest';
import app from '../../src/app.js';
import { userService } from '../../src/services/index.js';
import { generateToken } from '../../src/utils/jwt.js';

describe('User Routes', () => {
    const testUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        type: 'rider'
    };

    beforeEach(() => {
        // Clear any existing users
        userService.getUsers().length = 0;
    });

    describe('POST /api/users/register', () => {
        it('should register a new user successfully', async () => {
            const response = await request(app)
                .post('/api/users/register')
                .send(testUser);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('message', 'User registered successfully');
        });

        it('should return 409 for duplicate email', async () => {
            userService.registerUser(testUser);

            const response = await request(app)
                .post('/api/users/register')
                .send(testUser);

            expect(response.status).toBe(409);
            expect(response.body).toHaveProperty('error', 'User already exists');
        });
    });

    describe('POST /api/users/login', () => {
        beforeEach(async () => {
            userService.registerUser(testUser);
        });

        it('should login successfully', async () => {
            const response = await request(app)
                .post('/api/users/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Login successful');
            expect(response.body).toHaveProperty('token');
        });

        it('should return 401 for invalid credentials', async () => {
            const response = await request(app)
                .post('/api/users/login')
                .send({
                    email: testUser.email,
                    password: 'wrongpassword'
                });

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Invalid credentials');
        });
    });

    describe('POST /api/users/logout', () => {
        let token;

        beforeEach(async () => {
            userService.registerUser(testUser);
            token = generateToken({
                id: 1,
                email: testUser.email,
                type: testUser.type
            });
        });

        it('should logout successfully', async () => {
            const response = await request(app)
                .post('/api/users/logout')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Logout successful');
        });

        it('should return 401 without token', async () => {
            const response = await request(app)
                .post('/api/users/logout');

            expect(response.status).toBe(401);
        });
    });
});