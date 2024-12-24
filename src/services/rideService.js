import { locationService, userService } from './index.js';
import createError from 'http-errors';
import UserStatus from '../enums/userStatus.js';
import RideStatus from '../enums/rideStatus.js';

const rides = [];

export const createRide = (userId, source, destination, fareId) => {
    const ride = {
        id: rides.length + 1,
        userId,
        source,
        destination,
        fareId,
        driverId: null,
        status: RideStatus.NOT_CONFIRMED,
        createdAt: new Date(),
        completedAt: null
    };
    rides.push(ride);
    return ride;
};

export const confirmRide = (rideId, userId) => {
    const ride = rides.find((r) => r.id === rideId);

    if (!ride) throw createError(404, 'Ride not found');
    if (ride.userId !== userId) throw createError(403, 'Unauthorized to confirm this ride');
    if (ride.status !== RideStatus.NOT_CONFIRMED)
        throw createError(400, 'Ride has already been confirmed or completed');

    const nearestDriver = locationService.matchDriver(ride.source);
    if (!nearestDriver) throw createError(400, 'No available drivers');

    userService.updateUser(nearestDriver.driver_id, { status: UserStatus.BUSY });

    ride.driverId = nearestDriver.driver_id;
    ride.status = RideStatus.PENDING;

    return ride;
};

export const completeRide = (rideId, driverId) => {
    const ride = rides.find((r) => r.id === rideId);
    
    if (!ride) {
        throw createError(404, 'Ride not found');
    }

    if (ride.driverId !== driverId) {
        throw createError(403, 'Unauthorized: Only assigned driver can complete the ride');
    }

    if (ride.status === RideStatus.COMPLETED) {
        throw createError(400, 'Ride is already completed');
    }

    if (ride.status !== RideStatus.PENDING) {
        throw createError(400, 'Cannot complete a ride that is not in pending status');
    }

    ride.status = RideStatus.COMPLETED;
    ride.completedAt = new Date();

    userService.updateUser(driverId, { status: UserStatus.AVAILABLE });

    return ride;
};

export const getRides = () => rides;

export default { createRide, confirmRide, completeRide, getRides };