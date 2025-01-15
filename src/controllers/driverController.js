import driverService from '../services/driverService.js';

export const updateLocation = async (req, res, next) => {
    try {
        const { driverId } = req.params;
        const { longitude, latitude } = req.body;
        await driverService.updateDriverLocation(parseInt(driverId), longitude, latitude, req.user.id);
        res.status(200).json({ message: 'Location updated successfully' });
    } catch (error) {
        next(error);
    }
};

export const updateStatus = async (req, res, next) => {
    try {
        const { driverId } = req.params;
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        await driverService.updateDriverStatus(parseInt(driverId), status, req.user.id);
        res.status(200).json({ message: 'Status updated successfully' });
    } catch (error) {
        next(error);
    }
};

export default { updateLocation, updateStatus };
