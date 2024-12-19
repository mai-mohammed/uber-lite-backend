import request from 'supertest';
import app from '../../src/app.js';
import setupTestData from './testSetup.js';

describe('Ride Confirmation Route', () => {
    let token;
    let rideId;

    beforeAll(() => {
        const { token: generatedToken, rideId: generatedRideId } = setupTestData();
        token = generatedToken;
        rideId = generatedRideId;
    });

    it('should confirm a ride successfully', async () => {
        const response = await request(app)
            .post('/api/rides/confirm')
            .set('Authorization', `Bearer ${token}`)
            .send({ rideId });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id', rideId);
        expect(response.body).toHaveProperty('status', 'pending');
    });
});
