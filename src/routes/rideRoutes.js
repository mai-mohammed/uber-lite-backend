import express from 'express';
import { rideController } from '../controllers/index.js';
import { authMiddleware } from '../middlewares/index.js';

const router = express.Router();

router.post('/confirm', authMiddleware, rideController.confirmRide);
router.post('/:rideId/complete', authMiddleware, rideController.completeRide);

export default router;
