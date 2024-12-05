import { rideService } from '../services/index.js';

export const confirmRide = (req, res, next) => {
    try {
        const { rideId } = req.body;

        if (!rideId) {
            return res.status(400).json({ error: 'Ride ID is required' });
        }

        const ride = rideService.getRides().find((r) => r.id === rideId);

        if (!ride) {
            return res.status(404).json({ error: 'Ride not found' });
        }

        if (ride.status !== 'not-confirmed') {
            return res.status(400).json({ error: 'Ride has already been confirmed or completed' });
        }

        ride.status = 'pending';

        res.status(200).json({ ...ride });
    } catch (error) {
        next(error);
    }
};

export default { confirmRide };
