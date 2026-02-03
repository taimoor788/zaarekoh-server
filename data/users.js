const users = [
    {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'adminuser123', // Will be hashed by pre-save hook
        isAdmin: true
    },
    {
        name: 'John Doe',
        email: 'user@example.com',
        password: '123456',
        isAdmin: false
    }
];

module.exports = users;