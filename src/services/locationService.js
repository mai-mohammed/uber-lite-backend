import createError from 'http-errors';

// Haversine Formula to calculate distance between two points
export const calculateDistance = (coord1, coord2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371;

    const dLat = toRad(coord2.latitude - coord1.latitude);
    const dLon = toRad(coord2.longitude - coord1.longitude);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(coord1.latitude)) * Math.cos(toRad(coord2.latitude)) * Math.sin(dLon / 2) ** 2;

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const isValidCoordinates = (latitude, longitude) => {
    // Latitude must be between -90 and 90
    const isValidLatitude = typeof latitude === 'number' &&
        !isNaN(latitude) &&
        latitude >= -90 &&
        latitude <= 90;

    // Longitude must be between -180 and 180
    const isValidLongitude = typeof longitude === 'number' &&
        !isNaN(longitude) &&
        longitude >= -180 &&
        longitude <= 180;

    return isValidLatitude && isValidLongitude;
};

export const validateLocation = (location) => {
    if (!location || typeof location !== 'object') {
        throw createError(400, 'Location must be an object');
    }

    const { latitude, longitude } = location;

    if (!isValidCoordinates(latitude, longitude)) {
        throw createError(400, 'Invalid coordinates');
    }
};

export default { calculateDistance, validateLocation };