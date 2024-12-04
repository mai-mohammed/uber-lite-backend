import { userService } from '../services/index.js';

export const register = (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        const user = userService.registerUser({ name, email, password, role });
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        next(error);
    }
};

export const login = (req, res, next) => {
    try {
        const { email, password } = req.body;
        const { token, user } = userService.loginUser({ email, password });
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        next(error);
    }
};

export const logout = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(400).json({ error: 'No token provided' });
        }

        const result = userService.logoutUser(token);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};


export default { register, login, logout };
