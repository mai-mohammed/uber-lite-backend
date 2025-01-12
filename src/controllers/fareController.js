import { rideService } from '../services/index.js';

export const getFareEstimation = (req, res, next) => {
    try {
        const { source, destination } = req.body;
        const ride = rideService.createRide(req.user.id, source, destination);
        res.status(200).json({ ride });
    } catch (error) {
        next(error);
    }
};

export default { getFareEstimation };
