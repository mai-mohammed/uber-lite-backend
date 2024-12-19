import request from 'supertest';
import app from '../../src/app.js';
import setupTestData from './testSetup.js';

describe('User Routes', () => {
    beforeAll(() => {
        setupTestData();
    });

    it('should log in a user and return a JWT token', async () => {
        const response = await request(app).post('/api/users/login').send({
            email: 'mai@example.com',
            password: 'password',
        });
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Login successful');
        expect(response.body).toHaveProperty('token');
    });
});
