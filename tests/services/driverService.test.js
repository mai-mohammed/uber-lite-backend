import { driverService, userService } from '../../src/services/index.js';
import UserStatus from '../../src/enums/userStatus.js';

jest.mock('../../src/services/userService.js');

describe('Driver Service', () => {
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
                type: 'driver',
                status: UserStatus.AVAILABLE
            }]));

            userService.getAvailableDrivers.mockImplementation(() => [mockDriverId]);
        });

        it('should update existing driver location', () => {
            driverService.updateDriverLocation(mockDriverId, mockLocation.longitude, mockLocation.latitude, mockDriverId);

            const nearestDriver = driverService.matchDriver({
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
                driverService.updateDriverLocation(
                    nonExistentDriverId,
                    mockLocation.longitude,
                    mockLocation.latitude,
                    nonExistentDriverId
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
                { id: 1, type: 'driver', status: UserStatus.AVAILABLE },
                { id: 2, type: 'driver', status: UserStatus.AVAILABLE }
            ]));

            // Update locations with the driver's own ID as userId
            driverService.updateDriverLocation(1, -73.935242, 40.730610, 1);
            driverService.updateDriverLocation(2, -73.985428, 40.748817, 2);

            const nearestDriver = driverService.matchDriver({
                latitude: 40.730610,
                longitude: -73.935242
            });
            expect(nearestDriver.driver_id).toBe(1);
        });

        it('should return null when no drivers available', () => {
            userService.getAvailableDrivers.mockImplementation(() => []);

            const nearestDriver = driverService.matchDriver({
                latitude: 40.730610,
                longitude: -73.935242
            });

            expect(nearestDriver).toBeNull();
        });
    });

    describe('updateDriverStatus', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            userService.getUsers.mockImplementation(() => ([{
                id: mockDriverId,
                name: 'Test Driver',
                email: 'driver@test.com',
                type: 'driver',
                status: UserStatus.AVAILABLE
            }]));
        });

        it('should update driver status successfully', () => {
            const updatedDriver = driverService.updateDriverStatus(
                mockDriverId, 
                UserStatus.BUSY, 
                mockDriverId
            );

            expect(updatedDriver.status).toBe(UserStatus.BUSY);
        });

        it('should throw error for unauthorized update', () => {
            expect(() => 
                driverService.updateDriverStatus(mockDriverId, UserStatus.BUSY, 999)
            ).toThrow('Unauthorized: Only the driver can update their own status');
        });

        it('should throw error for invalid status', () => {
            expect(() => 
                driverService.updateDriverStatus(mockDriverId, 'invalid_status', mockDriverId)
            ).toThrow('Invalid status');
        });
    });
}); 