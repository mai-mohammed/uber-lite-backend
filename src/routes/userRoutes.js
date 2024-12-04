import express from 'express';
import { userController } from '../controllers/index.js';
import { authMiddleware } from '../middlewares/index.js';

const router = express.Router();

router.post('/register', userController.register);
router.post('/login', userController.login);

router.post('/logout', authMiddleware, userController.logout);

export default router;
