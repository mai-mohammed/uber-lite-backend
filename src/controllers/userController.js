import { userService } from '../services/index.js';


const getUsers = (req, res, next) => {
    try {
        const users = userService.fetchUsers();
        res.json(users);
    } catch (error) {
        next(error);
    }
};

const createUser = (req, res, next) => {
    try {
        const user = userService.addUser(req.body);
        res.status(201).json(user);
    } catch (error) {
        next(error);
    }
};

export default { getUsers, createUser };
