import request from 'supertest';
import app from '../../src/app.js';
import setupTestData from './testSetup.js';

describe('Fare Estimation Route', () => {
    let token;

    beforeAll(() => {
        const { token: generatedToken } = setupTestData();
        token = generatedToken;
    });

    it('should return a valid fare estimation and create a ride', async () => {
        const response = await request(app)
            .post('/api/fares')
            .set('Authorization', `Bearer ${token}`)
            .send({
                source: { latitude: 40.7359, longitude: -73.9911 },
                destination: { latitude: 40.748817, longitude: -73.985428 },
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('fare');
        expect(response.body).toHaveProperty('ride');
    });
});
