import express from 'express';
import { userController } from '../controllers/index.js';
import { authMiddleware } from '../middlewares/index.js';

const router = express.Router();

router.get('/', userController.getUsers);

router.post('/', authMiddleware, userController.createUser);

export default router;
