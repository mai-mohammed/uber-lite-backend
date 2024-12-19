import bcrypt from 'bcrypt';
import { userService, locationService, fareService, rideService } from '../../src/services/index.js';
import { generateToken } from '../../src/utils/jwt.js';
import UserStatus from '../../src/enums/userStatus.js';

// Mock Data Setup
export const setupTestData = () => {
    const users = [
        {
            id: 1,
            name: 'Mai Moh',
            email: 'mai@example.com',
            password: 'password',
            role: 'rider',
            status: UserStatus.ACTIVE,
        },
        {
            id: 2,
            name: 'Driver A',
            email: 'driverA@example.com',
            password: 'password',
            role: 'driver',
            status: UserStatus.AVAILABLE,
        },
        {
            id: 3,
            name: 'Driver B',
            email: 'driverB@example.com',
            password: 'password',
            role: 'driver',
            status: UserStatus.AVAILABLE,
        },
        {
            id: 4,
            name: 'Driver C',
            email: 'driverC@example.com',
            password: 'password',
            role: 'driver',
            status: UserStatus.BUSY,
        },
    ];

    users.forEach(user => {
        userService.createUser(user);
        console.log(`Created user: ${user.email} with status: ${user.status}`);
    });

    const token = generateToken({ id: 1, email: 'mai@example.com', role: 'rider' });

    const locations = [
        { driver_id: 2, latitude: 40.730610, longitude: -73.935242 }, // Driver A
        { driver_id: 3, latitude: 40.748817, longitude: -73.985428 }, // Driver B
        { driver_id: 4, latitude: 40.7128, longitude: -74.0060 },      // Driver C
    ];

    locations.forEach(loc => {
        locationService.updateDriverLocation(loc.driver_id, loc.longitude, loc.latitude);
        console.log(`Set location for driver ${loc.driver_id}: (${loc.latitude}, ${loc.longitude})`);
    });

    const source = { latitude: 40.7359, longitude: -73.9911 };
    const destination = { latitude: 40.748817, longitude: -73.985428 };

    const fareEstimation = fareService.calculateFare(source, destination);
    const fare = fareService.createFare(1, fareEstimation); // Rider ID: 1

    const ride = rideService.createRide(1, source, destination, fare.id); // Rider ID: 1

    return { token, rideId: ride.id };
};

export default setupTestData;