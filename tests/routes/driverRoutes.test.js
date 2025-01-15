import request from 'supertest';
import app from '../../src/app.js';
import { userService } from '../../src/services/index.js';
import { generateToken } from '../../src/utils/jwt.js';
import UserStatus from '../../src/enums/userStatus.js';

describe('Driver Routes', () => {
    const testDriver = {
        id: 1,
        name: 'Test Driver',
        email: 'driver@test.com',
        password: 'password123',
        type: 'driver'
    };

    const anotherDriver = {
        id: 2,
        name: 'Another Driver',
        email: 'another@test.com',
        password: 'password123',
        type: 'driver'
    };

    const validLocation = {
        latitude: 40.730610,
        longitude: -73.935242
    };

    let driverToken;

    beforeEach(() => {
        jest.clearAllMocks();
        userService.getUsers().length = 0;
        userService.registerUser(testDriver);
        userService.registerUser(anotherDriver);
        driverToken = generateToken(testDriver);
    });

    describe('PUT /api/drivers/:driverId/location', () => {
        it('should update driver location successfully', async () => {
            const response = await request(app)
                .put(`/api/drivers/${testDriver.id}/location`)
                .set('Authorization', `Bearer ${driverToken}`)
                .send(validLocation);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Location updated successfully');
        });

        it('should return 403 when driver tries to update another driver location', async () => {
            const response = await request(app)
                .put(`/api/drivers/${anotherDriver.id}/location`)
                .set('Authorization', `Bearer ${driverToken}`)
                .send(validLocation);

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('error', 'Unauthorized: Only the driver can update their own location');
        });

        it('should return 404 for non-existent driver', async () => {
            const nonExistentDriverId = 999;
            const response = await request(app)
                .put(`/api/drivers/${nonExistentDriverId}/location`)
                .set('Authorization', `Bearer ${driverToken}`)
                .send(validLocation);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Driver not found');
        });
    });

    describe('PUT /api/drivers/:driverId/status', () => {
        it('should update status successfully', async () => {
            const response = await request(app)
                .put(`/api/drivers/${testDriver.id}/status`)
                .set('Authorization', `Bearer ${driverToken}`)
                .send({ status: UserStatus.AVAILABLE });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Status updated successfully');
        });

        it('should return 403 when driver tries to update another driver status', async () => {
            const response = await request(app)
                .put(`/api/drivers/${anotherDriver.id}/status`)
                .set('Authorization', `Bearer ${driverToken}`)
                .send({ status: UserStatus.AVAILABLE });

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('error', 'Unauthorized: Only the driver can update their own status');
        });

        it('should return 400 when status is missing', async () => {
            const response = await request(app)
                .put(`/api/drivers/${testDriver.id}/status`)
                .set('Authorization', `Bearer ${driverToken}`)
                .send({});

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Status is required');
        });

        it('should return 400 when status is invalid', async () => {
            const response = await request(app)
                .put(`/api/drivers/${testDriver.id}/status`)
                .set('Authorization', `Bearer ${driverToken}`)
                .send({ status: 'invalid_status' });

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('Invalid status');
        });
    });
}); 