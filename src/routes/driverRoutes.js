import express from 'express';
import { driverController } from '../controllers/index.js';
import { authMiddleware } from '../middlewares/index.js';

const router = express.Router();

router.put('/:driverId/location', authMiddleware, driverController.updateLocation);
router.put('/:driverId/status', authMiddleware, driverController.updateStatus);

export default router;
