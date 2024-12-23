import { locationService, userService } from '../../src/services/index.js';
import UserStatus from '../../src/enums/userStatus.js';
import createError from 'http-errors';

jest.mock('../../src/services/userService.js');

describe('Location Service', () => {
    const mockDriverId = 1;
    const mockLocation = {
        latitude: 40.730610,
        longitude: -73.935242
    };


    describe('updateDriverLocation', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            userService.getUsers.mockImplementation(() => ([{
                id: mockDriverId,
                name: 'Test Driver',
                email: 'driver@test.com',
                role: 'driver',
                status: UserStatus.AVAILABLE
            }]));

            userService.getAvailableDrivers.mockImplementation(() => [mockDriverId]);
        });

        it('should update existing driver location', () => {
            locationService.updateDriverLocation(mockDriverId, mockLocation.longitude, mockLocation.latitude);

            const nearestDriver = locationService.matchDriver({
                latitude: 40.7359,
                longitude: -73.9911
            });

            expect(nearestDriver.driver_id).toBe(mockDriverId);
            expect(nearestDriver.latitude).toBe(mockLocation.latitude);
            expect(nearestDriver.longitude).toBe(mockLocation.longitude);
        });

        it('should throw error when driver does not exist', () => {
            const nonExistentDriverId = 999;

            expect(() =>
                locationService.updateDriverLocation(
                    nonExistentDriverId,
                    mockLocation.longitude,
                    mockLocation.latitude
                )
            ).toThrow('Driver not found');
        });
    });

    describe('matchDriver', () => {
        beforeEach(() => {
            userService.getAvailableDrivers.mockImplementation(() => [1, 2, 3]);
        });

        it('should return nearest available driver', () => {
            userService.getUsers.mockImplementation(() => ([
                { id: 1, role: 'driver', status: UserStatus.AVAILABLE },
                { id: 2, role: 'driver', status: UserStatus.AVAILABLE }
            ]));
            locationService.updateDriverLocation(1, -73.935242, 40.730610);
            locationService.updateDriverLocation(2, -73.985428, 40.748817);

            const nearestDriver = locationService.matchDriver({
                latitude: 40.730610,
                longitude: -73.935242
            });
            expect(nearestDriver.driver_id).toBe(1);
        });

        it('should return null when no drivers available', () => {
            userService.getAvailableDrivers.mockImplementation(() => []);

            const nearestDriver = locationService.matchDriver({
                latitude: 40.730610,
                longitude: -73.935242
            });

            expect(nearestDriver).toBeNull();
        });
    });
});

describe('validateLocation', () => {
    const validLocation = {
        latitude: 40.7359,
        longitude: -73.9911
    };

    it('should validate correct location object', () => {
        expect(() => locationService.validateLocation(validLocation)).not.toThrow();
    });

    it('should throw error for missing location object', () => {
        expect(() => locationService.validateLocation(null))
            .toThrow(createError(400, 'Location must be an object'));
    });

    it('should throw error for invalid coordinates', () => {
        const invalidLocation = {
            latitude: null,
            longitude: -73.9911
        };

        expect(() => locationService.validateLocation(invalidLocation))
            .toThrow(createError(400, 'Invalid coordinates'));
    });

    it('should throw error for out of boundary coordinates', () => {
        const outOfBoundLocations = [
            { latitude: 91, longitude: -73.9911 },    // latitude > 90
            { latitude: -91, longitude: -73.9911 },   // latitude < -90
            { latitude: 40.7359, longitude: 181 },    // longitude > 180
            { latitude: 40.7359, longitude: -181 }    // longitude < -180
        ];

        outOfBoundLocations.forEach(location => {
            expect(() => locationService.validateLocation(location))
                .toThrow(createError(400, 'Invalid coordinates'));
        });
    });
}); 