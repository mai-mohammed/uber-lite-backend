import { locationService } from '../../src/services/index.js';
import createError from 'http-errors';

describe('Location Service', () => {
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
}); 