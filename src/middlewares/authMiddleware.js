import { verifyToken } from '../utils/jwt.js';
import { userService } from '../services/index.js';

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    if (userService.isTokenBlacklisted(token)) {
        return res.status(401).json({ error: 'Unauthorized: Token has been invalidated' });
    }

    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

export default authMiddleware;
