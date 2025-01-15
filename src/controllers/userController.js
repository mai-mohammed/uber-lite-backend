import { userService } from '../services/index.js';

export const register = (req, res, next) => {
    try {
        const { name, email, password, type, status } = req.body;

            if (!name || !email || !password || !type) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const user = userService.registerUser({ name, email, password, type, status });
        res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        if (error.message === 'User already exists') {
            return res.status(409).json({ error: error.message });
        }
        next(error); 
    }
};

export const login = (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const { token, user } = userService.loginUser({ email, password });
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        if (error.message === 'Invalid credentials') {
            return res.status(401).json({ error: error.message });
        }
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
