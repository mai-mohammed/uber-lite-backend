import { rideService, driverService, userService, fareService } from '../../src/services/index.js';
import createError from 'http-errors';
import RideStatus from '../../src/enums/rideStatus.js';

jest.mock('../../src/services/driverService.js');
jest.mock('../../src/services/userService.js');
jest.mock('../../src/services/fareService.js');

describe('Ride Service', () => {
    const mockSource = { latitude: 40.7359, longitude: -73.9911 };
    const mockDestination = { latitude: 40.748817, longitude: -73.985428 };
    const userId = 1;
    const driverId = 2;

    beforeEach(() => {
        jest.clearAllMocks();
        driverService.matchDriver.mockImplementation(() => ({
            driver_id: driverId,
            latitude: 40.730610,
            longitude: -73.935242
        }));
        userService.reserveDriver.mockImplementation((id) => ({ id, status: 'busy' }));
        userService.releaseDriver.mockImplementation((id) => ({ id, status: 'available' }));
        fareService.calculateFare.mockImplementation(() => 25);
    });

    describe('createRide', () => {
        it('should create a new ride', () => {
            const ride = rideService.createRide(userId, mockSource, mockDestination);

            expect(ride).toEqual(expect.objectContaining({
                id: expect.any(Number),
                rider_id: userId,
                source_lat: mockSource.latitude,
                source_lng: mockSource.longitude,
                destination_lat: mockDestination.latitude,
                destination_lng: mockDestination.longitude,
                fare_amount: 25,
                status: RideStatus.NOT_CONFIRMED,
                driver_id: null,
                completed_at: null
            }));
            expect(fareService.calculateFare).toHaveBeenCalledWith(mockSource, mockDestination);
        });
    });

    describe('confirmRide', () => {
        it('should confirm a ride and assign a driver', () => {
            const ride = rideService.createRide(userId, mockSource, mockDestination);
            const confirmedRide = rideService.confirmRide(ride.id, userId);

            expect(confirmedRide.status).toBe(RideStatus.PENDING);
            expect(confirmedRide.driver_id).toBe(driverId);
            expect(userService.reserveDriver).toHaveBeenCalledWith(driverId);
        });

        it('should throw error when no drivers available', () => {
            driverService.matchDriver.mockImplementation(() => null);
            const ride = rideService.createRide(userId, mockSource, mockDestination);

            expect(() => rideService.confirmRide(ride.id, userId))
                .toThrow(createError(400, 'No available drivers'));
        });

        it('should throw error for unauthorized user', () => {
            const ride = rideService.createRide(userId, mockSource, mockDestination);
            expect(() => rideService.confirmRide(ride.id, 999))
                .toThrow(createError(403, 'Unauthorized to confirm this ride'));
        });
    });

    describe('completeRide', () => {
        it('should complete a ride and release the driver', () => {
            const ride = rideService.createRide(userId, mockSource, mockDestination);
            rideService.confirmRide(ride.id, userId);
            rideService.handleRideResponse(ride.id, driverId, true);
            rideService.startRide(ride.id, driverId);
            
            const completedRide = rideService.completeRide(ride.id, driverId);

            expect(completedRide.status).toBe(RideStatus.COMPLETED);
            expect(completedRide.completed_at).toBeInstanceOf(Date);
            expect(userService.releaseDriver).toHaveBeenCalledWith(driverId);
        });

        it('should throw error when completing a non-started ride', () => {
            const ride = rideService.createRide(userId, mockSource, mockDestination);
            rideService.confirmRide(ride.id, userId);
            rideService.handleRideResponse(ride.id, driverId, true);

            expect(() => rideService.completeRide(ride.id, driverId))
                .toThrow(createError(400, 'Ride must be started first'));
        });
    });

    describe('cancelRide', () => {
        it('should cancel a confirmed ride and release the driver', () => {
            const ride = rideService.createRide(userId, mockSource, mockDestination);
            rideService.confirmRide(ride.id, userId);
            rideService.handleRideResponse(ride.id, driverId, true);
            const cancelledRide = rideService.cancelRide(ride.id, userId);

            expect(cancelledRide.status).toBe(RideStatus.CANCELLED);
            expect(cancelledRide.cancelled_at).toBeInstanceOf(Date);
            expect(userService.releaseDriver).toHaveBeenCalledWith(driverId);
        });

        it('should throw error for unauthorized user', () => {
            const ride = rideService.createRide(userId, mockSource, mockDestination);
            expect(() => rideService.cancelRide(ride.id, 999))
                .toThrow(createError(403, 'Unauthorized: Only ride creator can cancel the ride'));
        });
    });

    describe('handleRideResponse', () => {
        it('should accept a ride request successfully', () => {
            const ride = rideService.createRide(userId, mockSource, mockDestination);
            rideService.confirmRide(ride.id, userId);
            const acceptedRide = rideService.handleRideResponse(ride.id, driverId, true);

            expect(acceptedRide.driver_id).toBe(driverId);
        });

        it('should reject a ride request successfully', () => {
            const ride = rideService.createRide(userId, mockSource, mockDestination);
            rideService.confirmRide(ride.id, userId);
            const rejectedRide = rideService.handleRideResponse(ride.id, driverId, false);

            expect(rejectedRide.status).toBe(RideStatus.PENDING);
        });

        it('should throw error when responding to non-pending ride', () => {
            const ride = rideService.createRide(userId, mockSource, mockDestination);
            
            expect(() => rideService.handleRideResponse(ride.id, driverId, true))
                .toThrow(createError(400, 'Can only respond to pending ride requests'));
        });

        it('should throw error for non-existent ride', () => {
            expect(() => rideService.handleRideResponse(999, driverId, true))
                .toThrow(createError(404, 'Ride not found'));
        });
    });
});