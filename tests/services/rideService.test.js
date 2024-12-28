import { rideService, locationService, userService } from '../../src/services/index.js';
import createError from 'http-errors';
import RideStatus from '../../src/enums/rideStatus.js';

jest.mock('../../src/services/locationService.js');
jest.mock('../../src/services/userService.js');

describe('Ride Service', () => {
    const mockSource = { latitude: 40.7359, longitude: -73.9911 };
    const mockDestination = { latitude: 40.748817, longitude: -73.985428 };
    const userId = 1;
    const driverId = 2;

    beforeEach(() => {
        jest.clearAllMocks();
        locationService.matchDriver.mockImplementation(() => ({
            driver_id: driverId,
            latitude: 40.730610,
            longitude: -73.935242
        }));
        userService.reserveDriver.mockImplementation((id) => ({ id, status: 'busy' }));
        userService.releaseDriver.mockImplementation((id) => ({ id, status: 'available' }));
    });

    describe('createRide', () => {
        it('should create a new ride', () => {
            const ride = rideService.createRide(userId, mockSource, mockDestination, 1);

            expect(ride).toEqual(expect.objectContaining({
                id: expect.any(Number),
                userId,
                source: mockSource,
                destination: mockDestination,
                fareId: 1,
                status: RideStatus.NOT_CONFIRMED,
                driverId: null,
                createdAt: expect.any(Date)
            }));
        });
    });

    describe('confirmRide', () => {
        it('should confirm a ride and assign a driver', () => {
            const ride = rideService.createRide(userId, mockSource, mockDestination, 1);
            const confirmedRide = rideService.confirmRide(ride.id, userId);

            expect(confirmedRide.status).toBe(RideStatus.PENDING);
            expect(confirmedRide.driverId).toBe(driverId);
            expect(userService.reserveDriver).toHaveBeenCalledWith(driverId);
        });

        it('should throw error when no drivers available', () => {
            locationService.matchDriver.mockImplementation(() => null);
            const ride = rideService.createRide(userId, mockSource, mockDestination, 1);

            expect(() => rideService.confirmRide(ride.id, userId))
                .toThrow(createError(400, 'No available drivers'));
        });

        it('should throw error for unauthorized user', () => {
            const ride = rideService.createRide(userId, mockSource, mockDestination, 1);
            expect(() => rideService.confirmRide(ride.id, 999))
                .toThrow(createError(403, 'Unauthorized to confirm this ride'));
        });
    });

    describe('completeRide', () => {
        it('should complete a ride and release the driver', () => {
            const ride = rideService.createRide(userId, mockSource, mockDestination, 1);
            rideService.confirmRide(ride.id, userId);
            const completedRide = rideService.completeRide(ride.id, driverId);

            expect(completedRide.status).toBe(RideStatus.COMPLETED);
            expect(completedRide.completedAt).toBeInstanceOf(Date);
            expect(userService.releaseDriver).toHaveBeenCalledWith(driverId);
        });
    });

    describe('cancelRide', () => {
        it('should cancel a confirmed ride and release the driver', () => {
            const ride = rideService.createRide(userId, mockSource, mockDestination, 1);
            rideService.confirmRide(ride.id, userId);
            const cancelledRide = rideService.cancelRide(ride.id, userId);

            expect(cancelledRide.status).toBe(RideStatus.CANCELLED);
            expect(cancelledRide.completedAt).toBeInstanceOf(Date);
            expect(userService.releaseDriver).toHaveBeenCalledWith(driverId);
        });

        it('should throw error for unauthorized user', () => {
            const ride = rideService.createRide(userId, mockSource, mockDestination, 1);
            expect(() => rideService.cancelRide(ride.id, 999))
                .toThrow(createError(403, 'Unauthorized: Only ride creator can cancel the ride'));
        });
    });
}); 