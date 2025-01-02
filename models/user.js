

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    passwordHash: {
        type: String,
        default: null,
    },
    isAdmin: {
        type: Boolean,   
        default:false
    },
});

module.exports = mongoose.model('User', UserSchema);
