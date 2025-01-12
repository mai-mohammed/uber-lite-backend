import userService from './userService.js';
import locationService from './locationService.js';
import createError from 'http-errors';

const driverLocations = [];

export const updateDriverLocation = (driverId, longitude, latitude, userId) => {
    // Validate driver exists and is a driver
    const users = userService.getUsers();
    const driver = users.find(user => user.id === driverId && user.type === 'driver');

    if (!driver) {
        throw createError(404, 'Driver not found');
    }

    // Check if the requesting user is the driver
    if (driver.id !== userId) {
        throw createError(403, 'Unauthorized: Only the driver can update their own location');
    }

    locationService.validateLocation({ latitude, longitude });

    const existingLocation = driverLocations.find(loc => loc.driver_id === driverId);
    if (existingLocation) {
        existingLocation.longitude = longitude;
        existingLocation.latitude = latitude;
        existingLocation.timestamp = new Date();
    } else {
        driverLocations.push({
            driver_id: driverId,
            longitude,
            latitude,
            timestamp: new Date()
        });
    }
};

export const matchDriver = (source) => {
    const availableDrivers = new Set(userService.getAvailableDrivers()); // Available driver IDs

    // Filter only available drivers' locations
    const availableLocations = driverLocations.filter(loc => availableDrivers.has(loc.driver_id));

    if (availableLocations.length === 0) return null;

    // Sort locations by distance using the Haversine formula
    const nearestDriver = availableLocations
        .map(driver => ({
            ...driver,
            distance: locationService.calculateDistance(source, { 
                latitude: driver.latitude, 
                longitude: driver.longitude 
            })
        }))
        .sort((a, b) => a.distance - b.distance)[0]; // Pick the nearest driver

    return nearestDriver;
};

export default { updateDriverLocation, matchDriver };
