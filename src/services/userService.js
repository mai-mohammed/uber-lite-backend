import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt.js';
import createError from 'http-errors';
import UserStatus from '../enums/userStatus.js';

const users = [];
let blacklistedTokens = [];

const createUser = ({ id, name, email, password, role, status }) => {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = { id, name, email, password: hashedPassword, role, status };
    users.push(newUser);
    return newUser;
};

export const registerUser = ({ name, email, password, role, status }) => {
    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
        throw createError(409, 'User already exists');
    }

    const newUser = createUser({
        id: users.length + 1,
        name,
        email,
        password,
        role,
        status: status || UserStatus.ACTIVE,
    });
    return newUser;
};

export const loginUser = ({ email, password }) => {
    const user = users.find((user) => user.email === email);
    if (!user) {
        throw createError(401, 'Invalid credentials'); // Unauthorized
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
        throw createError(401, 'Invalid credentials'); // Unauthorized
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

export const getAvailableDrivers = () => {
    const availableDrivers = users
        .filter(user => user.role === 'driver' && user.status === UserStatus.AVAILABLE)
        .map(driver => driver.id);
    return availableDrivers;
};

export const updateUser = (userId, userData) => {
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
        throw createError(404, 'User not found');
    }

    // Update only the provided fields
    users[userIndex] = {
        ...users[userIndex],
        ...userData
    };

    return users[userIndex];
};

export const getUsers = () => users;

export default { registerUser, loginUser, logoutUser, isTokenBlacklisted, getUsers, createUser, getAvailableDrivers, updateUser };