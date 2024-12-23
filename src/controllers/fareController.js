import { fareService, rideService, locationService } from '../services/index.js';

export const getFareEstimation = (req, res, next) => {
    try {
        const { source, destination } = req.body;

        locationService.validateLocation(source);
        locationService.validateLocation(destination);

        const fareEstimation = fareService.calculateFare(source, destination);
        const fare = fareService.createFare(req.user.id, fareEstimation);

        const ride = rideService.createRide(req.user.id, source, destination, fare.id);

        res.status(200).json({ fare, ride });
    } catch (error) {
        next(error);
    }
};

export default { getFareEstimation };
