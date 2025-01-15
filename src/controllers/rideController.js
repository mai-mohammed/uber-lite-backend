import { rideService } from '../services/index.js';

export const confirmRide = (req, res, next) => {
    try {
        const { rideId } = req.body;

        if (!rideId) {
            return res.status(400).json({ error: 'Ride ID is required' });
        }

        const ride = rideService.confirmRide(parseInt(rideId), req.user.id);

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

export const cancelRide = (req, res, next) => {
    try {
        const { rideId } = req.params;
        
        if (!rideId) {
            return res.status(400).json({ error: 'Ride ID is required' });
        }

        const ride = rideService.cancelRide(parseInt(rideId), req.user.id);
        
        res.status(200).json({ 
            message: 'Ride cancelled successfully',
            ride 
        });
    } catch (error) {
        next(error);
    }
};

export const startRide = (req, res, next) => {
    try {
        const { rideId } = req.params;
        
        if (!rideId) {
            return res.status(400).json({ error: 'Ride ID is required' });
        }

        const ride = rideService.startRide(parseInt(rideId), req.user.id);
        
        res.status(200).json({ 
            message: 'Ride started successfully',
            ride 
        });
    } catch (error) {
        next(error);
    }
};

export const respondToRideRequest = (req, res, next) => {
    try {
        const { rideId } = req.params;
        const { isAccepted } = req.body;
        
        if (!rideId) {
            return res.status(400).json({ error: 'Ride ID is required' });
        }
        
        if (isAccepted === undefined || typeof isAccepted !== 'boolean') {
            return res.status(400).json({ error: 'Valid response (true/false) is required' });
        }

        const ride = rideService.handleRideResponse(parseInt(rideId), req.user.id, isAccepted);
        
        res.status(200).json({ 
            message: `Ride ${isAccepted ? 'accepted' : 'rejected'} successfully`,
            ride 
        });
    } catch (error) {
        next(error);
    }
};

export default { confirmRide, completeRide, cancelRide, startRide, respondToRideRequest };
