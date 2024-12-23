import { rideService, locationService, userService } from '../../src/services/index.js';
import createError from 'http-errors';

jest.mock('../../src/services/locationService.js');
jest.mock('../../src/services/userService.js');

describe('Ride Service', () => {
    const mockSource = { latitude: 40.7359, longitude: -73.9911 };
    const mockDestination = { latitude: 40.748817, longitude: -73.985428 };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createRide', () => {
        it('should create a new ride', () => {
            const userId = 1;
            const fareId = 1;

            const ride = rideService.createRide(userId, mockSource, mockDestination, fareId);

            expect(ride).toEqual(expect.objectContaining({
                id: expect.any(Number),
                userId,
                source: mockSource,
                destination: mockDestination,
                fareId,
                status: 'not-confirmed',
                driverId: null,
                createdAt: expect.any(Date)
            }));
        });
    });

    describe('confirmRide', () => {
        beforeEach(() => {
            locationService.matchDriver.mockImplementation(() => ({
                driver_id: 2,
                latitude: 40.730610,
                longitude: -73.935242
            }));
        });

        it('should confirm a ride and assign a driver', () => {
            const ride = rideService.createRide(1, mockSource, mockDestination, 1);
            const confirmedRide = rideService.confirmRide(ride.id);

            expect(confirmedRide.status).toBe('pending');
            expect(confirmedRide.driverId).toBe(2);
            expect(userService.updateUser).toHaveBeenCalledWith(2, { status: 'busy' });
        });

        it('should throw error when no drivers available', () => {
            locationService.matchDriver.mockImplementation(() => null);
            const ride = rideService.createRide(1, mockSource, mockDestination, 1);

            expect(() => rideService.confirmRide(ride.id))
                .toThrow(createError(400, 'No available drivers'));
        });

        it('should throw error for non-existent ride', () => {
            expect(() => rideService.confirmRide(999))
                .toThrow(createError(404, 'Ride not found'));
        });

        it('should throw error for already confirmed ride', () => {
            const ride = rideService.createRide(1, mockSource, mockDestination, 1);
            rideService.confirmRide(ride.id);

            expect(() => rideService.confirmRide(ride.id))
                .toThrow(createError(400, 'Ride has already been confirmed or completed'));
        });
    });
}); 