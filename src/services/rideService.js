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

export const getRides = () => rides;

export default { createRide, getRides };
