import request from 'supertest';
import app from '../../src/app.js';

describe('Fare Estimation Route', () => {
    let token;

    beforeAll(async () => {
        await request(app).post('/api/users/register').send({
            name: 'Mai Moh',
            email: 'mai@example.com',
            password: '123456',
            role: 'rider',
        });

        const loginResponse = await request(app).post('/api/users/login').send({
            email: 'mai@example.com',
            password: '123456',
        });

        token = loginResponse.body.token;
    });

    it('should return a valid fare estimation and create a ride', async () => {
        const response = await request(app)
            .post('/api/fares')
            .set('Authorization', `Bearer ${token}`)
            .send({
                source: 'Location A',
                destination: 'Location B',
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('fare');
        expect(response.body.fare).toHaveProperty('id');
        expect(response.body.fare).toHaveProperty('fare');
        expect(response.body.fare.fare).toBeGreaterThan(0);

        expect(response.body).toHaveProperty('ride');
        expect(response.body.ride).toHaveProperty('id');
        expect(response.body.ride).toHaveProperty('source', 'Location A');
        expect(response.body.ride).toHaveProperty('destination', 'Location B');
        expect(response.body.ride).toHaveProperty('status', 'not-confirmed');
    });

    it('should return a 400 error when source or destination is missing', async () => {
        const response1 = await request(app)
            .post('/api/fares')
            .set('Authorization', `Bearer ${token}`)
            .send({ source: 'Location A' });

        expect(response1.status).toBe(400);
        expect(response1.body).toHaveProperty('error', 'Source and destination are required');

        const response2 = await request(app)
            .post('/api/fares')
            .set('Authorization', `Bearer ${token}`)
            .send({ destination: 'Location B' });

        expect(response2.status).toBe(400);
        expect(response2.body).toHaveProperty('error', 'Source and destination are required');
    });
});
