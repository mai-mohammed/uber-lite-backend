const fares = [];

export const calculateFare = (source, destination) => {
    const baseFare = 5;
    const ratePerKm = 2;
    const distanceInKm = 10; // Mock distance calculation
    return baseFare + distanceInKm * ratePerKm;
};

export const createFare = (userId, fareEstimation) => {
    const fare = { id: fares.length + 1, userId, fare: fareEstimation, timestamp: new Date() };
    fares.push(fare);
    return fare;
};

export const getFares = () => fares;

export default { calculateFare, createFare, getFares };
