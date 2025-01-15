import request from 'supertest';
import app from '../../src/app.js';
import { userService, rideService, fareService, driverService } from '../../src/services/index.js';
import { generateToken } from '../../src/utils/jwt.js';
import UserStatus from '../../src/enums/userStatus.js';
import RideStatus from '../../src/enums/rideStatus.js';

describe('Ride Routes', () => {
    const testRider = {
        id: 1,
        name: 'Test Rider',
        email: 'rider@test.com',
        password: 'password123',
        type: 'rider'
    };

    const testDriver = {
        id: 2,
        name: 'Test Driver',
        email: 'driver@test.com',
        password: 'password123',
        type: 'driver',
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
            type: testRider.type
        });

        // Create a test ride
        const source = { latitude: 40.7359, longitude: -73.9911 };
        const destination = { latitude: 40.748817, longitude: -73.985428 };
        ride = rideService.createRide(testRider.id, source, destination);

        // Update driver's location to be near the pickup point
        driverService.updateDriverLocation(
            testDriver.id,
            source.longitude,
            source.latitude,
            testDriver.id
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
    });

    describe('POST /api/rides/:rideId/complete', () => {
        let driverToken;

        beforeEach(async () => {
            // Generate token for driver
            driverToken = generateToken({
                id: testDriver.id,
                email: testDriver.email,
                type: testDriver.type
            });

            // Setup ride through all required states
            await request(app)
                .post('/api/rides/confirm')
                .set('Authorization', `Bearer ${token}`)
                .send({ rideId: ride.id });

            // Driver accepts the ride
            await request(app)
                .put(`/api/rides/${ride.id}/respond`)
                .set('Authorization', `Bearer ${driverToken}`)
                .send({ isAccepted: true });

            // Start the ride
            await request(app)
                .post(`/api/rides/${ride.id}/start`)
                .set('Authorization', `Bearer ${driverToken}`);
        });

        it('should complete ride successfully', async () => {
            const response = await request(app)
                .post(`/api/rides/${ride.id}/complete`)
                .set('Authorization', `Bearer ${driverToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Ride completed successfully');
            expect(response.body.ride).toHaveProperty('status', RideStatus.COMPLETED);
            expect(response.body.ride).toHaveProperty('completed_at');
        });

        it('should return 403 when non-assigned driver tries to complete ride', async () => {
            const wrongDriverToken = generateToken({
                id: 999,
                email: 'wrong@driver.com',
                type: 'driver'
            });

            const response = await request(app)
                .post(`/api/rides/${ride.id}/complete`)
                .set('Authorization', `Bearer ${wrongDriverToken}`);

            expect(response.status).toBe(403);
        });
    });

    describe('POST /api/rides/:rideId/cancel', () => {
        let riderToken;
        let confirmedRide;

        beforeEach(async () => {
            riderToken = generateToken({
                id: testRider.id,
                email: testRider.email,
                type: testRider.type
            });

            const source = { latitude: 40.7359, longitude: -73.9911 };
            const destination = { latitude: 40.748817, longitude: -73.985428 };
            confirmedRide = rideService.createRide(testRider.id, source, destination);
        });

        it('should cancel ride successfully when pending', async () => {
            const response = await request(app)
                .post(`/api/rides/${confirmedRide.id}/cancel`)
                .set('Authorization', `Bearer ${riderToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Ride cancelled successfully');
            expect(response.body.ride).toHaveProperty('status', RideStatus.CANCELLED);
            expect(response.body.ride).toHaveProperty('cancelled_at');
        });

        it('should return 400 when cancelling completed ride', async () => {
            // Setup ride through all states until completion
            await request(app)
                .post('/api/rides/confirm')
                .set('Authorization', `Bearer ${riderToken}`)
                .send({ rideId: confirmedRide.id });

            const driverToken = generateToken({
                id: testDriver.id,
                email: testDriver.email,
                type: testDriver.type
            });

            await request(app)
                .put(`/api/rides/${confirmedRide.id}/respond`)
                .set('Authorization', `Bearer ${driverToken}`)
                .send({ isAccepted: true });

            await request(app)
                .post(`/api/rides/${confirmedRide.id}/start`)
                .set('Authorization', `Bearer ${driverToken}`);

            await request(app)
                .post(`/api/rides/${confirmedRide.id}/complete`)
                .set('Authorization', `Bearer ${driverToken}`);

            const response = await request(app)
                .post(`/api/rides/${confirmedRide.id}/cancel`)
                .set('Authorization', `Bearer ${riderToken}`);

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('Cannot cancel a ride with status');
        });

        it('should return 403 when non-owner tries to cancel ride', async () => {
            const wrongUserToken = generateToken({
                id: 999,
                email: 'wrong@user.com',
                type: 'rider'
            });

            const response = await request(app)
                .post(`/api/rides/${confirmedRide.id}/cancel`)
                .set('Authorization', `Bearer ${wrongUserToken}`);

            expect(response.status).toBe(403);
        });
    });

    describe('PUT /api/rides/:rideId/respond', () => {
        let driverToken;
        let confirmedRide;

        beforeEach(async () => {
            driverToken = generateToken({
                id: testDriver.id,
                email: testDriver.email,
                type: testDriver.type
            });

            const source = { latitude: 40.7359, longitude: -73.9911 };
            const destination = { latitude: 40.748817, longitude: -73.985428 };
            confirmedRide = rideService.createRide(testRider.id, source, destination);
            
            await request(app)
                .post('/api/rides/confirm')
                .set('Authorization', `Bearer ${token}`)
                .send({ rideId: confirmedRide.id });
        });

        it('should accept ride request successfully', async () => {
            const response = await request(app)
                .put(`/api/rides/${confirmedRide.id}/respond`)
                .set('Authorization', `Bearer ${driverToken}`)
                .send({ isAccepted: true });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Ride accepted successfully');
            expect(response.body.ride).toHaveProperty('status', RideStatus.READY);
            expect(response.body.ride).toHaveProperty('driver_id', testDriver.id);
        });

        it('should reject ride request successfully', async () => {
            const response = await request(app)
                .put(`/api/rides/${confirmedRide.id}/respond`)
                .set('Authorization', `Bearer ${driverToken}`)
                .send({ isAccepted: false });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Ride rejected successfully');
            expect(response.body.ride).toHaveProperty('status', RideStatus.PENDING);
        });

        it('should return 400 when isAccepted is missing', async () => {
            const response = await request(app)
                .put(`/api/rides/${confirmedRide.id}/respond`)
                .set('Authorization', `Bearer ${driverToken}`)
                .send({});

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Valid response (true/false) is required');
        });
    });
});