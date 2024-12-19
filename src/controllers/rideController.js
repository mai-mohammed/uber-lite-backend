import { rideService } from '../services/index.js';

export const confirmRide = (req, res, next) => {
    try {
        const { rideId } = req.body;

        if (!rideId) {
            return res.status(400).json({ error: 'Ride ID is required' });
        }

        const ride = rideService.confirmRide(rideId);

        res.status(200).json({ ...ride });
    } catch (error) {
        next(error);
    }
};

export default { confirmRide };