import request from 'supertest';
import app from '../../src/app.js';
import { userService, rideService, fareService, locationService } from '../../src/services/index.js';
import { generateToken } from '../../src/utils/jwt.js';
import UserStatus from '../../src/enums/userStatus.js';

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
            expect(response.body).toHaveProperty('status', 'pending');
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
});