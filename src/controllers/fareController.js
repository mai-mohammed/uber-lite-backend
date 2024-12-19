import { fareService, rideService } from '../services/index.js';

export const getFareEstimation = (req, res, next) => {
    try {
        const { source, destination } = req.body;

        // Validate source and destination
        const isValidLocation = (location) =>
            location &&
            typeof location.latitude === 'number' &&
            typeof location.longitude === 'number';

        if (!req.user?.id || !isValidLocation(source) || !isValidLocation(destination)) {
            return res.status(400).json({ error: 'Invalid source or destination. Latitude and longitude are required.' });
        }

        const fareEstimation = fareService.calculateFare(source, destination);
        const fare = fareService.createFare(req.user.id, fareEstimation);

        const ride = rideService.createRide(req.user.id, source, destination, fare.id);

        res.status(200).json({ fare, ride });
    } catch (error) {
        next(error);
    }
};

export default { getFareEstimation };
