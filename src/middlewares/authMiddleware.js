const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token || token !== 'my-secret-token') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

export default authMiddleware;
