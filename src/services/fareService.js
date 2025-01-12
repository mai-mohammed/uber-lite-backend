import { locationService } from './index.js';

export const calculateFare = (source, destination) => {
    locationService.validateLocation(source);
    locationService.validateLocation(destination);
    const baseFare = 5;
    const ratePerKm = 2;
    const distanceInKm = 10; // Mock distance calculation
    return baseFare + distanceInKm * ratePerKm;
};

export default { calculateFare };
