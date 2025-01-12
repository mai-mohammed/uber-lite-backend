import request from 'supertest';
import app from '../../src/app.js';
import { userService } from '../../src/services/index.js';
import { generateToken } from '../../src/utils/jwt.js';

describe('Fare Routes', () => {
    const testUser = {
        id: 1,
        name: 'Test Rider',
        email: 'rider@test.com',
        password: 'password123',
        type: 'rider'
    };

    let token;

    beforeEach(async () => {
        userService.getUsers().length = 0;
        userService.registerUser(testUser);
        token = generateToken({
            id: testUser.id,
            email: testUser.email,
            type: testUser.type
        });
    });

    describe('POST /api/fares', () => {
        const validLocation = {
            source: { latitude: 40.7359, longitude: -73.9911 },
            destination: { latitude: 40.748817, longitude: -73.985428 }
        };

        it('should return ride with fare estimation successfully', async () => {
            const response = await request(app)
                .post('/api/fares')
                .set('Authorization', `Bearer ${token}`)
                .send(validLocation);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('ride');
            expect(response.body.ride).toHaveProperty('fare_amount');
            expect(response.body.ride).toHaveProperty('source_lat');
            expect(response.body.ride).toHaveProperty('source_lng');
            expect(response.body.ride).toHaveProperty('destination_lat');
            expect(response.body.ride).toHaveProperty('destination_lng');
        });

        it('should return 400 for invalid coordinates', async () => {
            const invalidLocation = {
                source: { latitude: 91, longitude: -73.9911 },
                destination: { latitude: 40.748817, longitude: -73.985428 }
            };

            const response = await request(app)
                .post('/api/fares')
                .set('Authorization', `Bearer ${token}`)
                .send(invalidLocation);

            expect(response.status).toBe(400);
        });

        it('should return 401 without authentication', async () => {
            const response = await request(app)
                .post('/api/fares')
                .send(validLocation);

            expect(response.status).toBe(401);
        });
    });
});