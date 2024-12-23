import { locationService, userService } from './index.js';
import createError from 'http-errors';
import UserStatus from '../enums/userStatus.js';

const rides = [];

export const createRide = (userId, source, destination, fareId) => {
    const ride = {
        id: rides.length + 1,
        userId,
        source,
        destination,
        fareId,
        driverId: null,
        status: 'not-confirmed',
        createdAt: new Date(),
    };
    rides.push(ride);
    return ride;
};

export const confirmRide = (rideId) => {
    const ride = rides.find((r) => r.id === rideId);

    if (!ride) throw createError(404, 'Ride not found');
    if (ride.status !== 'not-confirmed')
        throw createError(400, 'Ride has already been confirmed or completed');

    const nearestDriver = locationService.matchDriver(ride.source);
    if (!nearestDriver) throw createError(400, 'No available drivers');

    userService.updateUser(nearestDriver.driver_id, { status: UserStatus.BUSY });

    ride.driverId = nearestDriver.driver_id;
    ride.status = 'pending';

    return ride;
};
export const getRides = () => rides;

export default { createRide, confirmRide, getRides };