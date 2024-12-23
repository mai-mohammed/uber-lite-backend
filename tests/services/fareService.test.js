import { fareService } from '../../src/services/index.js';

describe('Fare Service', () => {
    const mockSource = { latitude: 40.7359, longitude: -73.9911 };
    const mockDestination = { latitude: 40.748817, longitude: -73.985428 };

    describe('calculateFare', () => {
        it('should calculate fare correctly with valid coordinates', () => {
            const fare = fareService.calculateFare(mockSource, mockDestination);
            expect(fare).toBe(25); // Base fare (5) + (10km * 2)
        });

        it('should handle invalid coordinates', () => {
            const invalidSource = { latitude: null, longitude: -73.9911 };
            expect(() => fareService.calculateFare(invalidSource, mockDestination)).toThrow();
        });
    });

    describe('createFare', () => {
        it('should create a new fare record', () => {
            const userId = 1;
            const fareEstimation = 25;
            const fare = fareService.createFare(userId, fareEstimation);

            expect(fare).toEqual(expect.objectContaining({
                id: expect.any(Number),
                userId,
                fare: fareEstimation,
                timestamp: expect.any(Date)
            }));
        });

        it('should add fare to the fares array', () => {
            const initialFaresCount = fareService.getFares().length;
            fareService.createFare(1, 25);
            expect(fareService.getFares().length).toBe(initialFaresCount + 1);
        });
    });
}); 