import { driverService, userService, fareService, locationService } from './index.js';
import createError from 'http-errors';
import UserStatus from '../enums/userStatus.js';
import RideStatus from '../enums/rideStatus.js';

const rides = [];

export const createRide = (userId, source, destination) => {
    locationService.validateLocation(source);
    locationService.validateLocation(destination);
    
    const fareAmount = fareService.calculateFare(source, destination);
    
    const ride = {
        id: rides.length + 1,
        rider_id: userId,
        driver_id: null,
        source_lat: source.latitude,
        source_lng: source.longitude,
        destination_lat: destination.latitude,
        destination_lng: destination.longitude,
        fare_amount: fareAmount,
        status: RideStatus.NOT_CONFIRMED,
        completed_at: null,
        cancelled_at: null,
        started_at: null,
        created_at: new Date()
    };
    rides.push(ride);
    return ride;
};

export const confirmRide = (rideId, userId) => {
    const ride = rides.find((r) => r.id === rideId);

    if (!ride) throw createError(404, 'Ride not found');
    if (ride.rider_id !== userId) throw createError(403, 'Unauthorized to confirm this ride');
    if (ride.status !== RideStatus.NOT_CONFIRMED)
        throw createError(400, 'Ride has already been confirmed or completed');

    const nearestDriver = driverService.matchDriver({latitude: ride.source_lat, longitude: ride.source_lng});

    if (!nearestDriver) throw createError(400, 'No available drivers');

    userService.reserveDriver(nearestDriver.driver_id);
    
    ride.driver_id = nearestDriver.driver_id;
    ride.status = RideStatus.PENDING;

    return ride;
};

export const completeRide = (rideId, driverId) => {
    const ride = rides.find((r) => r.id === rideId);
    
    if (!ride) throw createError(404, 'Ride not found');
    if (ride.driver_id !== driverId) throw createError(403, 'Unauthorized: Only assigned driver can complete the ride');
    if (ride.status === RideStatus.COMPLETED) throw createError(400, 'Ride is already completed');
    if (ride.status !== RideStatus.PENDING) throw createError(400, 'Cannot complete a ride that is not in pending status');

    userService.releaseDriver(driverId);
    
    ride.status = RideStatus.COMPLETED;
    ride.completed_at = new Date();

    return ride;
};

export const cancelRide = (rideId, userId) => {
    const ride = rides.find((r) => r.id === rideId);
    
    if (!ride) throw createError(404, 'Ride not found');
    if (ride.rider_id !== userId) throw createError(403, 'Unauthorized: Only ride creator can cancel the ride');
    if (ride.status === RideStatus.COMPLETED) throw createError(400, 'Cannot cancel a completed ride');
    if (ride.status === RideStatus.CANCELLED) throw createError(400, 'Ride is already cancelled');

    if (ride.status === RideStatus.PENDING && ride.driver_id) {
        userService.releaseDriver(ride.driver_id);
    }

    ride.status = RideStatus.CANCELLED;
    ride.cancelled_at = new Date();

    return ride;
};

export const getRides = () => rides;

export default { createRide, confirmRide, completeRide, cancelRide, getRides };