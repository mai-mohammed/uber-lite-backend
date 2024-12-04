import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt.js';

const users = [];
let blacklistedTokens = [];

export const registerUser = ({ name, email, password, role }) => {
    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
        throw new Error('User already exists');
    }

    const hashedPassword = bcrypt.hash(password, 10);
    const newUser = { id: users.length + 1, name, email, password: hashedPassword, role };
    users.push(newUser);
    return newUser;
};

export const loginUser = ({ email, password }) => {
    const user = users.find((user) => user.email === email);
    if (!user) {
        throw new Error('Invalid credentials');
    }

    const isPasswordValid = bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid credentials');
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    return { token, user };
};

export const logoutUser = (token) => {
    blacklistedTokens.push(token);
    return { message: 'Logout successful' };
};

export const isTokenBlacklisted = (token) => {
    return blacklistedTokens.includes(token);
};

export default { registerUser, loginUser, logoutUser, isTokenBlacklisted, users };
