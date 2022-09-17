const mongoose = require('mongoose');
const commanFunc = require('../utilites/commanFunctions');
const UserSchema = new mongoose.Schema({
        role: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'role',
        },
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        fireBaseId: {
            type: String,
        },
        dob: {
            type: Date,
        },
        emailId: {
            type: String,
            required: true,
            index: true,
        },
        isPasswordTemp: {
            type: Boolean,
            default: false,
        },
        password: {
            type: String,
        },
        countryCode: {
            type: String,
        },
        mobileNumber: {
            type: String,
        },
        isActive: {
            type: Boolean,
            default: false,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        registeredWith: {
            type: String,
            index: true,
        },
        socialId: {
            type: String,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
        }
    },
    { timestamps: true },
);

UserSchema.pre('save', async function (next) {
    var user = this;
    if (user.password) {
        let hash = commanFunc.getHash(user.password);
        user.password = hash;
    }

    next();
});


module.exports = User = mongoose.model('user', UserSchema);
