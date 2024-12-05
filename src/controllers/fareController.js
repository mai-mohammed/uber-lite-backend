import { fareService, rideService } from '../services/index.js';

export const getFareEstimation = (req, res, next) => {
    try {
        const { source, destination } = req.body;

        if (!req.user.id || !source || !destination) {
            return res.status(400).json({ error: 'Source and destination are required' });
        }

        const fareEstimation = fareService.calculateFare(source, destination);
        const fare = fareService.createFare(req.user.id, fareEstimation);

        const ride = rideService.createRide(req.user.id, source, destination, fare.id);

        // matching logic here 
        
        res.status(200).json({ fare, ride });
    } catch (error) {
        next(error);
    }
};

export default { getFareEstimation };
