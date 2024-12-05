import request from 'supertest';
import app from '../../src/app.js';

describe('Ride Confirmation Route', () => {
    let token;
    let rideId;

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

        const fareResponse = await request(app)
            .post('/api/fares')
            .set('Authorization', `Bearer ${token}`)
            .send({
                source: 'Location A',
                destination: 'Location B',
            });

        rideId = fareResponse.body.ride.id;
    });

    it('should confirm a ride successfully', async () => {
        const response = await request(app)
            .post('/api/rides/confirm')
            .set('Authorization', `Bearer ${token}`)
            .send({ rideId });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id', rideId);
        expect(response.body).toHaveProperty('status', 'pending');
        expect(response.body).toHaveProperty('driverId', null);
    });

    it('should return a 400 error if rideId is missing', async () => {
        const response = await request(app)
            .post('/api/rides/confirm')
            .set('Authorization', `Bearer ${token}`)
            .send({});

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Ride ID is required');
    });

    it('should return a 404 error if rideId does not exist', async () => {
        const response = await request(app)
            .post('/api/rides/confirm')
            .set('Authorization', `Bearer ${token}`)
            .send({ rideId: 999 });

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'Ride not found');
    });
});
