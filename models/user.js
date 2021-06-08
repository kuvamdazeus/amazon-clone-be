const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    cartItems: Array,
    orders: Array,
    addresses: Array,
});

module.exports = mongoose.model('users', userSchema);