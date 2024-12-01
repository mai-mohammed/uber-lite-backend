const users = [];

const fetchUsers = () => {
    return users;
};

const addUser = (data) => {
    const newUser = { id: users.length + 1, ...data };
    users.push(newUser);
    return newUser;
};

export default { fetchUsers, addUser };
