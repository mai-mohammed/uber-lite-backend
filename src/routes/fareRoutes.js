import express from 'express';
import { fareController } from '../controllers/index.js';
import { authMiddleware } from '../middlewares/index.js';

const router = express.Router();
console.log('Reached /api/fares route');

router.post('/', authMiddleware, fareController.getFareEstimation);

export default router;
