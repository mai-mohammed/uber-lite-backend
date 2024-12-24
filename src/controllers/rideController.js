import { rideService } from '../services/index.js';

export const confirmRide = (req, res, next) => {
    try {
        const { rideId } = req.body;

        if (!rideId) {
            return res.status(400).json({ error: 'Ride ID is required' });
        }

        const ride = rideService.confirmRide(rideId, req.user.id);

        res.status(200).json({ ...ride });
    } catch (error) {
        next(error);
    }
};

export const completeRide = (req, res, next) => {
    try {
        const { rideId } = req.params;
        
        if (!rideId) {
            return res.status(400).json({ error: 'Ride ID is required' });
        }

        const ride = rideService.completeRide(parseInt(rideId), req.user.id);
        
        res.status(200).json({ 
            message: 'Ride completed successfully',
            ride 
        });
    } catch (error) {
        next(error);
    }
};

export default { confirmRide, completeRide };