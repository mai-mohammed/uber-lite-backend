import request from 'supertest';
import app from '../../src/app.js';
import { userService, rideService, fareService, locationService } from '../../src/services/index.js';
import { generateToken } from '../../src/utils/jwt.js';
import UserStatus from '../../src/enums/userStatus.js';
import RideStatus from '../../src/enums/rideStatus.js';

describe('Ride Routes', () => {
    const testRider = {
        id: 1,
        name: 'Test Rider',
        email: 'rider@test.com',
        password: 'password123',
        role: 'rider'
    };

    const testDriver = {
        id: 2,
        name: 'Test Driver',
        email: 'driver@test.com',
        password: 'password123',
        role: 'driver',
        status: UserStatus.AVAILABLE
    };

    let token;
    let ride;

    beforeEach(async () => {
        // Clear any existing users
        userService.getUsers().length = 0;
        
        // Register test users
        userService.registerUser(testRider);
        userService.registerUser(testDriver);
        
        // Generate token for rider
        token = generateToken({
            id: testRider.id,
            email: testRider.email,
            role: testRider.role
        });

        // Create a test ride
        const source = { latitude: 40.7359, longitude: -73.9911 };
        const destination = { latitude: 40.748817, longitude: -73.985428 };
        const fareEstimation = fareService.calculateFare(source, destination);
        const fare = fareService.createFare(testRider.id, fareEstimation);
        ride = rideService.createRide(testRider.id, source, destination, fare.id);

        // Update driver's location to be near the pickup point
        locationService.updateDriverLocation(
            testDriver.id,
            source.longitude,
            source.latitude
        );
    });

    describe('POST /api/rides/confirm', () => {
        it('should confirm ride successfully', async () => {
            const response = await request(app)
                .post('/api/rides/confirm')
                .set('Authorization', `Bearer ${token}`)
                .send({ rideId: ride.id });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id', ride.id);
            expect(response.body).toHaveProperty('status', RideStatus.PENDING);
        });

        it('should return 404 for non-existent ride', async () => {
            const response = await request(app)
                .post('/api/rides/confirm')
                .set('Authorization', `Bearer ${token}`)
                .send({ rideId: 999 });

            expect(response.status).toBe(404);
        });

        it('should return 401 without authentication', async () => {
            const response = await request(app)
                .post('/api/rides/confirm')
                .send({ rideId: ride.id });

            expect(response.status).toBe(401);
        });
    });

    describe('POST /api/rides/:rideId/complete', () => {
        let driverToken;

        beforeEach(async () => {
            // Generate token for driver
            driverToken = generateToken({
                id: testDriver.id,
                email: testDriver.email,
                role: testDriver.role
            });

            await request(app)
                .post('/api/rides/confirm')
                .set('Authorization', `Bearer ${token}`)
                .send({ rideId: ride.id });
        });

        it('should complete ride successfully', async () => {
            const response = await request(app)
                .post(`/api/rides/${ride.id}/complete`)
                .set('Authorization', `Bearer ${driverToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Ride completed successfully');
            expect(response.body.ride).toHaveProperty('status', RideStatus.COMPLETED);
            expect(response.body.ride).toHaveProperty('completedAt');
        });

        it('should return 403 when non-assigned driver tries to complete ride', async () => {
            const wrongDriverToken = generateToken({
                id: 999,
                email: 'wrong@driver.com',
                role: 'driver'
            });

            const response = await request(app)
                .post(`/api/rides/${ride.id}/complete`)
                .set('Authorization', `Bearer ${wrongDriverToken}`);

            expect(response.status).toBe(403);
        });

        it('should return 404 for non-existent ride', async () => {
            const response = await request(app)
                .post('/api/rides/999/complete')
                .set('Authorization', `Bearer ${driverToken}`);

            expect(response.status).toBe(404);
        });
    });

    describe('POST /api/rides/:rideId/cancel', () => {
        let riderToken;
        let confirmedRide;

        beforeEach(async () => {
            riderToken = generateToken({
                id: testRider.id,
                email: testRider.email,
                role: testRider.role
            });

            const source = { latitude: 40.7359, longitude: -73.9911 };
            const destination = { latitude: 40.748817, longitude: -73.985428 };
            const fareEstimation = fareService.calculateFare(source, destination);
            const fare = fareService.createFare(testRider.id, fareEstimation);
            confirmedRide = rideService.createRide(testRider.id, source, destination, fare.id);
            
            await request(app)
                .post('/api/rides/confirm')
                .set('Authorization', `Bearer ${riderToken}`)
                .send({ rideId: confirmedRide.id });
        });

        it('should cancel ride successfully', async () => {
            const response = await request(app)
                .post(`/api/rides/${confirmedRide.id}/cancel`)
                .set('Authorization', `Bearer ${riderToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Ride cancelled successfully');
            expect(response.body.ride).toHaveProperty('status', RideStatus.CANCELLED);
            expect(response.body.ride).toHaveProperty('completedAt');
        });

        it('should return 401 without authentication', async () => {
            const response = await request(app)
                .post(`/api/rides/${confirmedRide.id}/cancel`);

            expect(response.status).toBe(401);
        });

        it('should return 403 when non-owner tries to cancel ride', async () => {
            const wrongUserToken = generateToken({
                id: 999,
                email: 'wrong@user.com',
                role: 'rider'
            });

            const response = await request(app)
                .post(`/api/rides/${confirmedRide.id}/cancel`)
                .set('Authorization', `Bearer ${wrongUserToken}`);

            expect(response.status).toBe(403);
        });

        it('should return 404 for non-existent ride', async () => {
            const response = await request(app)
                .post('/api/rides/999/cancel')
                .set('Authorization', `Bearer ${riderToken}`);

            expect(response.status).toBe(404);
        });

        it('should return 400 when cancelling completed ride', async () => {
            const driverToken = generateToken({
                id: testDriver.id,
                email: testDriver.email,
                role: testDriver.role
            });

            await request(app)
                .post(`/api/rides/${confirmedRide.id}/complete`)
                .set('Authorization', `Bearer ${driverToken}`);

            const response = await request(app)
                .post(`/api/rides/${confirmedRide.id}/cancel`)
                .set('Authorization', `Bearer ${riderToken}`);

            expect(response.status).toBe(400);
        });
    });
});