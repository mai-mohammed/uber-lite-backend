import userService from './userService.js';

const driverLocations = [];

export const updateDriverLocation = (driverId, longitude, latitude) => {
    const existingLocation = driverLocations.find(loc => loc.driver_id === driverId);
    if (existingLocation) {
        existingLocation.longitude = longitude;
        existingLocation.latitude = latitude;
        existingLocation.timestamp = new Date();
    } else {
        driverLocations.push({ driver_id: driverId, longitude, latitude, timestamp: new Date() });
    }
};

// Haversine Formula to calculate distance between two points
const calculateDistance = (coord1, coord2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371;

    const dLat = toRad(coord2.latitude - coord1.latitude);
    const dLon = toRad(coord2.longitude - coord1.longitude);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(coord1.latitude)) * Math.cos(toRad(coord2.latitude)) * Math.sin(dLon / 2) ** 2;

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

// Match the Nearest Available Driver
export const matchDriver = (source) => {
    const availableDrivers = new Set(userService.getAvailableDrivers()); // Available driver IDs

    // Filter only available drivers' locations
    const availableLocations = driverLocations.filter(loc => availableDrivers.has(loc.driver_id));


    if (availableLocations.length === 0) return null;

    // Sort locations by distance using the Haversine formula
    const nearestDriver = availableLocations
        .map(driver => {
            const distance = calculateDistance(source, { latitude: driver.latitude, longitude: driver.longitude });
            return {
                ...driver,
                distance,
            };
        })
        .sort((a, b) => a.distance - b.distance) // Ascending order of distance
        [0]; // Pick the nearest driver

    return nearestDriver;
};

export default { updateDriverLocation, matchDriver };