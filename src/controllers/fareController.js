import { fareService } from '../services/index.js';

export const getFareEstimation = (req, res, next) => {
    try {
        const { source, destination } = req.body;
        if (!req.user.id || !source || !destination) {
            return res.status(400).json({ error: 'Source, and destination are required' });
        }

        const fareEstimation = fareService.calculateFare(source, destination);

        const fareDetail = fareService.saveFareDetails(req.user.id, source, destination, fareEstimation);

        res.status(200).json({ ...fareDetail });
    } catch (error) {
        next(error);
    }
};

export default { getFareEstimation };
