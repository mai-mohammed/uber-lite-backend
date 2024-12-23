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
        role: 'rider'
    };

    let token;

    beforeEach(async () => {
        // Clear users and create test user
        userService.getUsers().length = 0;
        userService.registerUser(testUser);
        token = generateToken({
            id: testUser.id,
            email: testUser.email,
            role: testUser.role
        });
    });

    describe('POST /api/fares', () => {
        const validLocation = {
            source: { latitude: 40.7359, longitude: -73.9911 },
            destination: { latitude: 40.748817, longitude: -73.985428 }
        };

        it('should return fare estimation successfully', async () => {
            const response = await request(app)
                .post('/api/fares')
                .set('Authorization', `Bearer ${token}`)
                .send(validLocation);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('fare');
            expect(response.body).toHaveProperty('ride');
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