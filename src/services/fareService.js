let fares = [];

export const calculateFare = (source, destination) => {
    const baseFare = 5; // Fixed base fare
    const ratePerKm = 2; // Cost per kilometer

    // Mock distance calculation (for now, always return 10 km)
    const distanceInKm = 10;

    return baseFare + distanceInKm * ratePerKm;
};

export const saveFareDetails = (userId, source, destination, fare) => {
    const fareDetail = { id: fares.length + 1, userId, source, destination, fare, timestamp: new Date() };
    fares.push(fareDetail);
    return fareDetail;
};

export default { calculateFare, saveFareDetails, fares };
