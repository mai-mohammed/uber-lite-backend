import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../../src/app.js';
import { userService } from '../../src/services/index.js';

describe('User Routes', () => {
    let token;

    beforeAll(() => {
        userService.users.length = 0;
        userService.users.push({
            id: 1,
            name: 'Mai Moh',
            email: 'mai@example.com',
            password: bcrypt.hashSync('123456', 10),
            role: 'rider',
        });
    });

    it('should register a new user successfully', async () => {
        const response = await request(app).post('/api/users/register').send({
            name: 'New User',
            email: 'new@example.com',
            password: 'password',
            role: 'rider',
        });
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message', 'User registered successfully');
    });

    it('should log in a user and return a JWT token', async () => {
        const response = await request(app).post('/api/users/login').send({
            email: 'mai@example.com',
            password: '123456',
        });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Login successful');
        expect(response.body).toHaveProperty('token');
        token = response.body.token;
    });

    it('should log out a user by invalidating the token', async () => {
        console.log(token);
        const response = await request(app)
            .post('/api/users/logout')
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Logout successful');
    });

    it('should fail to log out with an invalid token', async () => {
        const response = await request(app)
            .post('/api/users/logout')
            .set('Authorization', 'Bearer invalidtoken');
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Unauthorized: Invalid token');
    });
});
