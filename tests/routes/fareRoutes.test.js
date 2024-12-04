import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../../src/app.js';
import { userService } from '../../src/services/index.js';

describe('Fare Estimation Route', () => {
    let token;

    beforeAll(async () => {
        userService.users.push({
            id: 1,
            name: 'Mai Moh',
            email: 'mai@example.com',
            password: bcrypt.hashSync('123456', 10),
            role: 'rider',
        });

        const response = await request(app)
            .post('/api/users/login')
            .send({
                email: 'mai@example.com',
                password: '123456',
            });

        token = response.body.token;
        expect(token).toBeDefined();
    });

    it('should return a valid fare estimation for a given source and destination', async () => {
        const response = await request(app)
            .post('/api/fares')
            .set('Authorization', `Bearer ${token}`)
            .send({
                source: 'Location A',
                destination: 'Location B',
            });

        console.log('Fare Estimation Response:', response.body);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('userId', 1);
        expect(response.body).toHaveProperty('source', 'Location A');
        expect(response.body).toHaveProperty('destination', 'Location B');
        expect(response.body).toHaveProperty('fare');
        expect(typeof response.body.fare).toBe('number');
        expect(response.body.fare).toBeGreaterThan(0);
    });

    it('should return a 400 error when source or destination is missing', async () => {
        const response1 = await request(app)
            .post('/api/fares')
            .set('Authorization', `Bearer ${token}`)
            .send({
                source: 'Location A',
            });

        expect(response1.status).toBe(400);
        expect(response1.body).toHaveProperty('error', 'Source, and destination are required');

        const response2 = await request(app)
            .post('/api/fares')
            .set('Authorization', `Bearer ${token}`)
            .send({
                destination: 'Location B',
            });

        expect(response2.status).toBe(400);
        expect(response2.body).toHaveProperty('error', 'Source, and destination are required');
    });
});
