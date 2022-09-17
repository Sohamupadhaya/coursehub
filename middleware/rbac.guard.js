const jwt_decode = require('jwt-decode');
const func = require('../utilites/sendResponse');
const commonFunc = require('../utilites/commanFunctions');
const User = require('../models/User');

module.exports = function permit(permitted) {
    return async (request, response, next) => {
        try {
            const token = request.header('Authorization');
            const decoded = jwt_decode(token);
            const user = await User.findOne({ _id: decoded.userId, isDeleted: false, isActive: true }).populate('role');

            if (user && commonFunc.arrayComparator(user.role.permissions, permitted)) {
                next();
            } else {
                //next()
                return func.unauthorizedCustomer(response);
            }
        } catch (err) {
            console.log(err);
            return func.unauthorizedCustomer(response);
        }
    };
};
