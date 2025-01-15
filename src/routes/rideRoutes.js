import express from 'express';
import { rideController } from '../controllers/index.js';
import { authMiddleware } from '../middlewares/index.js';

const router = express.Router();

router.post('/confirm', authMiddleware, rideController.confirmRide);
router.post('/:rideId/complete', authMiddleware, rideController.completeRide);
router.post('/:rideId/cancel', authMiddleware, rideController.cancelRide);
router.post('/:rideId/start', authMiddleware, rideController.startRide);
router.put('/:rideId/respond', authMiddleware, rideController.respondToRideRequest);

export default router;
