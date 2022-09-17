const HTTPStatusCode = require('http-status-code');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { validateLogin } = require('../validations/validateLogin');
const func = require('../utilites/sendResponse');
const commonFunc = require('../utilites/commanFunctions');
const logger = require('../utilites/logger');
const constant = require('../config/constant');
const { validateEmail } = require('../validations/validateEmail');
const { validateResetPassword } = require('../validations/validateResetPassword');
const { validateChangePassword } = require('../validations/validateChangePassword');
const { validateRegisterUser } = require('../validations/validateRegisterUser');
const secret = require('../config/secret-manager');
const { validateUserProfile } = require('../validations/validateUserProfile');
const { constants } = require('fs');


async function getUserByEmail(emailId) {
    return await User.findOne({
        emailId: emailId,
        isActive: true,
        isDeleted: false,
    });
}

async function getUserById(userId) {
    return await User.findOne({
        _id: userId,
        isActive: true,
        isDeleted: false,
    }).populate('role');
}

/**
 * Register user with google or email id
 * @param req
 * @param res
 * @param cb
 * @returns {Promise<void>}
 */
exports.registerUser = async (req, res, cb) => {
    try {
        const { errors, isValid } = validateRegisterUser(req.body);
        if (!isValid) {
            func.sendErrorMessage(HTTPStatusCode.getMessage(400, 'HTTP/1.1'), res, 400, errors);
            return;
        }

        const user = await User.findOne({
            emailId: req.body.emailId,
            isDeleted: false,
        });

        //---------user data logger---------
        logger.log.info({ logOf: 'register->user', data: user });

        // Check User
        if (user) {
            func.sendErrorMessage(HTTPStatusCode.getMessage(400, 'HTTP/1.1'), res, 400, [constant.Errormessage.EmailExist]);
            return;
        }

        const userData = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            emailId: req.body.emailId,
            password: req.body.password,
            mobileNumber: req.body.mobileNumber,
            countryCode: req.body.countryCode,
        });

        //---------user data logger---------
        logger.log.info({ logOf: 'register->userData', data: userData });

        let newUser = await userData.save();

        // Token Payload
        const payload = {
            id: newUser._id,
        };

        let token = await commonFunc.genToken(payload);

        // Verification mail
        const url = `${secret('front_end_url')}/verifyEmail/${token}`;
        const data = {
            name: newUser.firstName + ' ' + newUser.lastName,
            url: url,
        };
        commonFunc.sendTemplateEmail('confirmEmailTemplate.html', data, newUser.emailId, 'Verification link');
        func.sendSuccessData('', [constant.message.verificationEmail], res, 200);

    } catch (err) {
        console.log(err);
        if (err.name === 'ValidationError') {
            let errors = [];

            Object.keys(err.errors).forEach((key) => {
                errors.push(err.errors[key].message);
            });

            return func.sendErrorMessage(HTTPStatusCode.getMessage(400, 'HTTP/1.1'), res, 400, errors);

        }
        return func.sendErrorMessage(HTTPStatusCode.getMessage(500, 'HTTP/1.1'), res, 500, [constant.Errormessage.InternalServerError]);
    }
};

exports.registerUserV2 = async (req, res, cb) => {
    try {
        if (!req.body.socialType) {
            func.sendErrorMessage(HTTPStatusCode.getMessage(400, 'HTTP/1.1'), res, 400, [constant.Errormessage.SocialTypeRequired]);
            return;
        }

        //---------req body logger---------
        logger.log.info({ logOf: 'registerV2->req body', data: req.body });

        if (req.body.socialType == constant.RegisteredWith.EMAIL) {

            const {
                errors,
                isValid,
            } = validateRegisterUser(req.body, true, false);
            if (!isValid) {
                func.sendErrorMessage(HTTPStatusCode.getMessage(400, 'HTTP/1.1'), res, 400, errors);
                return;
            }

            const user = await User.findOne({
                emailId: req.body.emailId,
                isDeleted: false,
            });

            //---------user data logger---------
            logger.log.info({ logOf: 'registerV2->user', data: user });

            // Check User
            if (user) {
                func.sendErrorMessage(HTTPStatusCode.getMessage(400, 'HTTP/1.1'), res, 400, [constant.Errormessage.EmailExist]);
                return;
            }

            const userData = new User({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                emailId: req.body.emailId,
                password: req.body.password,
                mobileNumber: req.body.mobileNumber,
                countryCode: req.body.countryCode,
                registeredWith: req.body.socialType,
            });

            //---------user data logger---------
            logger.log.info({ logOf: 'registerV2->userData', data: userData });

            let newUser = await userData.save();

            // Token Payload
            const payload = {
                id: newUser._id,
            };

            let token = await commonFunc.genToken(payload);

            // Verification mail
            const url = `${secret('front_end_url')}/verifyEmail/${token}`;
            const data = {
                name: newUser.firstName + ' ' + newUser.lastName,
                link: url,
            };
            commonFunc.sendTemplateEmail('confirmEmailTemplate.html', data, newUser.emailId, 'Verification link');

            func.sendSuccessData('', [constant.message.verificationEmail], res, 200);
        } else if (req.body.socialType == constant.RegisteredWith.GOOGLE) {
            const {
                errors,
                isValid,
            } = validateRegisterUser(req.body, false, true);

            if (!isValid) {
                func.sendErrorMessage(HTTPStatusCode.getMessage(400, 'HTTP/1.1'), res, 400, errors);
                return;
            }
            const tokenPayload = await commonFunc.validateSocialToken(req.body.socialToken);
            if (!tokenPayload) {
                func.sendErrorMessage(HTTPStatusCode.getMessage(400, 'HTTP/1.1'), res, 400, [constant.Errormessage.GoogleTokenNotValid]);
                return;
            }

            //---------user data logger---------
            logger.log.info({ logOf: 'registerV2->GWT payload', data: tokenPayload });

            const user = await User.findOne({
                emailId: tokenPayload.email,
                isDeleted: false,
            });
            //---------user data logger---------
            logger.log.info({ logOf: 'registerV2->user', data: user });

            // Check User
            if (user) {
                func.sendErrorMessage(HTTPStatusCode.getMessage(400, 'HTTP/1.1'), res, 400, [constant.Errormessage.EmailExist]);
                return;
            }

            const userData = new User({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                emailId: tokenPayload.email,
                countryCode: req.body.countryCode,
                registeredWith: req.body.socialType,
                socialId: tokenPayload.sub,
                isActive: true,
            });

            let newUser = await userData.save();

            //---------user data logger---------
            logger.log.info({ logOf: 'registerV2->new user', data: newUser });

            func.sendSuccessData('', [constant.message.requestSuccess], res, 200);
            return;

        }

    } catch (err) {
        console.log(err);
        if (err.name === 'ValidationError') {
            let errors = [];

            Object.keys(err.errors).forEach((key) => {
                errors.push(err.errors[key].message);
            });

            return func.sendErrorMessage(HTTPStatusCode.getMessage(400, 'HTTP/1.1'), res, 400, errors);

        }
        return func.sendErrorMessage(HTTPStatusCode.getMessage(500, 'HTTP/1.1'), res, 500, [constant.Errormessage.InternalServerError]);
    }
};


exports.verifyEmail = async (req, res, cb) => {
    try {
        const token = req.params.token;
        const response = await commonFunc.validateToken(token);
        if (response.err) {
            func.sendErrorMessage(HTTPStatusCode.getMessage(401, 'HTTP/1.1'), res, 401, [constant.Errormessage[response.err]]);
            return;
        }
        console.log(response);
        const user = await User.findOne({ _id: response.id, isDeleted: false });

        //---------user data logger---------
        logger.log.info({ logOf: 'verifyEmail->user', data: user });

        // Check User
        if (!user) {
            func.sendErrorMessage(HTTPStatusCode.getMessage(404, 'HTTP/1.1'), res, 404, ['User Not Found']);
            return;
        }

        await User.findOneAndUpdate({ _id: user._id }, { isActive: true }, { upsert: true });

        func.sendSuccessData('', constant.message.accVerified, res, 200);
    } catch (err) {
        console.log(err);
        if (err.name === 'ValidationError') {
            let errors = [];

            Object.keys(err.errors).forEach((key) => {
                errors.push(err.errors[key].message);
            });

            return func.sendErrorMessage(HTTPStatusCode.getMessage(400, 'HTTP/1.1'), res, 400, errors);

        }
        return func.sendErrorMessage(HTTPStatusCode.getMessage(500, 'HTTP/1.1'), res, 500, [constant.Errormessage.InternalServerError]);
    }
};

/**
 * Login in to account using email address and password
 * @param {{body:{emailId:string,password:string}}} req
 * @param res
 * @param cb
 * @returns {Promise<token>}
 */
exports.login = async (req, res, cb) => {
    try {
        const { errors, isValid } = validateLogin(req.body);
        if (!isValid) {
            func.sendErrorMessage(HTTPStatusCode.getMessage(400, 'HTTP/1.1'), res, 400, errors);
            return;
        }

        const user = await User.findOne({
            emailId: req.body.emailId,
            isDeleted: false,
        }).populate('role');

        //---------user data logger---------
        logger.info(`---------user---------${user}`);

        // Check User
        if (!user) {
            func.sendErrorMessage(HTTPStatusCode.getMessage(404, 'HTTP/1.1'), res, 404, [constant.Errormessage.EmailIdPasswordIncorrect]);
            return;
        }

        if (!user.isActive) {
            func.sendErrorMessage(HTTPStatusCode.getMessage(400, 'HTTP/1.1'), res, 400, [constant.Errormessage.AccountNotVerified]);
            return;
        }

        const isMatch = commonFunc.compareHash(req.body.password, user.password);
        // Check password
        if (!isMatch) {
            errors.push(constant.Errormessage.incorrectPassword);
            func.sendErrorMessage(HTTPStatusCode.getMessage(400, 'HTTP/1.1'), res, 400, errors);
            return;
        }

        // Token Payload

        const payload = {
            userId: user._id,
            role: user.role,
        };

        let token = await commonFunc.genToken(payload, 10 * 60 * 60);
        let refreshToken = await commonFunc.genToken({ userId: payload.userId });

        const data = {
            accessToken: token,
            refreshToken: refreshToken,
        };
        func.sendSuccessData(data, constant.message.loginSuccess, res, 200);
    } catch (err) {
        console.log(err);
        if (err.name === 'ValidationError') {
            let errors = [];

            Object.keys(err.errors).forEach((key) => {
                errors.push(err.errors[key].message);
            });

            return func.sendErrorMessage(HTTPStatusCode.getMessage(400, 'HTTP/1.1'), res, 400, errors);

        }
        return func.sendErrorMessage(HTTPStatusCode.getMessage(500, 'HTTP/1.1'), res, 500, [constant.Errormessage.InternalServerError]);
    }
};

exports.loginV2 = async (req, res, cb) => {
    try {
        //---------body logger---------
        logger.log.info({ logOf: 'loginV2->req body', data: req.body });

        if (!req.body.socialType) {
            func.sendErrorMessage(HTTPStatusCode.getMessage(400, 'HTTP/1.1'), res, 400, [constant.Errormessage.SocialTypeRequired]);
            return;
        }

        if (req.body.socialType == constant.RegisteredWith.EMAIL) {
            const { errors, isValid } = validateLogin(req.body, true, false);
            if (!isValid) {
                func.sendErrorMessage(HTTPStatusCode.getMessage(400, 'HTTP/1.1'), res, 400, errors);
                return;
            }
            const user = await User.findOne({
                emailId: req.body.emailId,
                isDeleted: false,
            }).populate('role');

            //---------user data logger---------
            logger.log.info({ logOf: 'loginV2->req body', data: req.body });

            // Check User
            if (!user) {
                func.sendErrorMessage(HTTPStatusCode.getMessage(404, 'HTTP/1.1'), res, 404, [constant.Errormessage.EmailIdPasswordIncorrect]);
                return;
            }

            if (!user.isActive) {
                func.sendErrorMessage(HTTPStatusCode.getMessage(400, 'HTTP/1.1'), res, 400, [constant.Errormessage.AccountNotVerified]);
                return;
            }
            if (!user.password) {
                func.sendErrorMessage(HTTPStatusCode.getMessage(400, 'HTTP/1.1'), res, 400, [constant.Errormessage.InvalidLogin]);
                return;
            }
            const isMatch = commonFunc.compareHash(req.body.password, user.password);
            // Check password
            if (!isMatch) {
                errors.push(constant.Errormessage.incorrectPassword);
                func.sendErrorMessage(HTTPStatusCode.getMessage(400, 'HTTP/1.1'), res, 400, errors);
                return;
            }

            // Token Payload

            const payload = {
                userId: user._id,
                role: user.role,
            };

            let token = await commonFunc.genToken(payload, 10 * 60 * 60);
            let refreshToken = await commonFunc.genToken({ userId: payload.userId });

            const data = {
                accessToken: token,
                refreshToken: refreshToken,
            };
            func.sendSuccessData(data, constant.message.loginSuccess, res, 200);
        } else if (req.body.socialType == constant.RegisteredWith.GOOGLE) {

            // Check password
            const { errors, isValid } = validateLogin(req.body, false, true);
            if (!isValid) {
                func.sendErrorMessage(HTTPStatusCode.getMessage(400, 'HTTP/1.1'), res, 400, errors);
                return;
            }

            let tokenPayload = await commonFunc.validateSocialToken(req.body.socialToken);
            console.log(tokenPayload);
            if (!tokenPayload) {
                func.sendErrorMessage(HTTPStatusCode.getMessage(403, 'HTTP/1.1'), res, 403, [constant.Errormessage.GoogleTokenNotValid]);
                return;
            }

            // Token Payload

            const user = await User.findOne({
                socialId: tokenPayload.sub,
                isDeleted: false,
            }).populate('role');

            if (!user) {
                func.sendErrorMessage(HTTPStatusCode.getMessage(404, 'HTTP/1.1'), res, 404, [constant.Errormessage.recordNotFound]);
                return;
            }

            //---------user data logger---------
            logger.info(`---------user---------${user}`);

            // Check User
            if (!user) {
                func.sendErrorMessage(HTTPStatusCode.getMessage(404, 'HTTP/1.1'), res, 404, [constant.Errormessage.EmailIdPasswordIncorrect]);
                return;
            }

            const payload = {
                userId: user._id,
                role: user.role,
            };

            let token = await commonFunc.genToken(payload, 10 * 60 * 60);
            let refreshToken = await commonFunc.genToken({ userId: payload.userId });

            const data = {
                accessToken: token,
                refreshToken: refreshToken,
            };
            func.sendSuccessData(data, constant.message.loginSuccess, res, 200);

        }
    } catch (err) {
        console.log(err);
        if (err.name === 'ValidationError') {
            let errors = [];

            Object.keys(err.errors).forEach((key) => {
                errors.push(err.errors[key].message);
            });

            return func.sendErrorMessage(HTTPStatusCode.getMessage(400, 'HTTP/1.1'), res, 400, errors);

        }
        return func.sendErrorMessage(HTTPStatusCode.getMessage(500, 'HTTP/1.1'), res, 500, [constant.Errormessage.InternalServerError]);
    }
};


/**
 * Get access token using the refresh token
 * @param {{body:{refreshToken:string}}} req
 * @param res
 * @param cb
 * @returns {Promise<token>}
 */
exports.getToken = async (req, res, cb) => {
    if (!req.body.refreshToken) {
        func.sendErrorMessage(HTTPStatusCode.getMessage(400, 'HTTP/1.1'), res, 400, ['Refresh Token required']);
        return;
    }
    const response = await commonFunc.validateToken(req.body.refreshToken);
    if (response.err) {
        func.sendErrorMessage(HTTPStatusCode.getMessage(401, 'HTTP/1.1'), res, 401, [constant.Errormessage[response.err]]);
        return;
    }

    const { userId } = response;
    const user = await getUserById(userId);

    //---------user data logger---------
    logger.info(`---------user---------${user}`);

    // Check User
    if (!user) {
        func.sendErrorMessage(HTTPStatusCode.getMessage(404, 'HTTP/1.1'), res, 404, ['User Not Found']);
        return;
    }

    // Token Payload
    const payload = {
        userId: user._id,
        role: user.role,
    };

    let token = await commonFunc.genToken(payload, 24 * 60 * 60);

    const data = {
        accessToken: token,
        refreshToken: req.body.refreshToken,
    };
    func.sendSuccessData(data, constant.message.requestSuccess, res, 200);
};

/**
 * Forget password
 * @param {{body:{emailId:string}}} req
 * @param res
 * @param cb
 * @returns {Promise<void>}
 */
exports.forgetPassword = async (req, res, cb) => {
    const { errors, isValid } = validateEmail(req.body);

    if (!isValid) {
        func.sendErrorMessage(HTTPStatusCode.getMessage(400, 'HTTP/1.1'), res, 400, errors);
        return;
    }

    const user = await getUserByEmail(req.body.emailId);

    /* ---------user data logger--------- */
    logger.info(`---------user---------${user}`);

    /* Check User */
    if (!user) {
        func.sendErrorMessage(HTTPStatusCode.getMessage(404, 'HTTP/1.1'), res, 404, ['User Not Found']);
        return;
    }

    const payload = {
        id: user._id,
    };

    let token = await commonFunc.genToken(payload, 60 * 60);
    const url = `${secret('front_end_url')}/reset-password/${token}`;
    const data = {
        name: user.firstName + ' ' + user.lastName,
        link: url,
    };
    commonFunc.sendTemplateEmail('forgetPasswordTemplate.html', data, user.emailId, 'Forget Password');

    func.sendSuccessData('', constant.message.emailSent, res, 200);
};

/**
 * Verify forget password token
 * @param {{query:{token:string}}} req
 * @param res
 * @param cb
 * @returns {Promise<void>}
 */
exports.verifyPasswordToken = async (req, res, cb) => {
    if (!req.params.token) {
        func.sendErrorMessage(HTTPStatusCode.getMessage(400, 'HTTP/1.1'), res, 400, ['Token Not Found']);
        return;
    }
    const response = commonFunc.validateToken(req.params.token);
    if (response.err) {
        func.sendErrorMessage(HTTPStatusCode.getMessage(401, 'HTTP/1.1'), res, 401, [constant.Errormessage[response.err]]);
        return;
    }

    const user = await getUserById(response.id);

    /* ---------user data logger--------- */
    logger.info(`---------user---------${user}`);

    /* Check User */
    if (!user) {
        func.sendErrorMessage(HTTPStatusCode.getMessage(404, 'HTTP/1.1'), res, 404, [constant.Errormessage.recordNotFound]);
        return;
    }

    func.sendSuccessData({ valid: true }, constant.message.validToken, res, 200);
};

/**
 *  Reset password after forget password
 * @param {{body:{password:string,password2:string}}}req
 * @param res
 * @param cb
 * @returns {Promise<void>}
 */
exports.resetPassword = async (req, res, cb) => {
    if (!req.params.token) {
        func.sendErrorMessage(HTTPStatusCode.getMessage(400, 'HTTP/1.1'), res, 400, ['Token Not Found']);
        return;
    }

    const { errors, isValid } = validateResetPassword(req.body);

    if (!isValid) {
        func.sendErrorMessage(HTTPStatusCode.getMessage(400, 'HTTP/1.1'), res, 400, errors);
        return;
    }

    const response = await commonFunc.validateToken(req.params.token);
    if (response.err) {
        func.sendErrorMessage(HTTPStatusCode.getMessage(401, 'HTTP/1.1'), res, 401, [constant.Errormessage[response.err]]);
        return;
    }
    console.log(response);
    const user = await getUserById(response.id);

    /* ---------user data logger--------- */
    logger.info(`---------user---------${user}`);

    /* Check User */
    if (!user) {
        func.sendErrorMessage(HTTPStatusCode.getMessage(404, 'HTTP/1.1'), res, 404, ['User Not Found']);
        return;
    }

    let hash = commonFunc.getHash(req.body.password);

    await User.findOneAndUpdate({ _id: response.id }, { password: hash }, { upsert: true });

    func.sendSuccessData('', constant.message.passwordUpdated, res, 200);
};

/**
 * Change User Password
 * @param {{body:{password:string,newPassword:string,confirmPassword:string}}} req
 * @param res
 * @param cb
 * @returns {Promise<void>}
 */
exports.changePassword = async (req, res, cb) => {
    try {
        const { errors, isValid } = validateChangePassword(req.body, false);

        if (!isValid) {
            func.sendErrorMessage(HTTPStatusCode.getMessage(400, 'HTTP/1.1'), res, 400, errors);
            return;
        }

        const user = await User.findOne({
            _id: req.user._id,
            isActive: true,
            isDeleted: false,
        });
        // Check User
        if (!user) {
            func.sendErrorMessage(HTTPStatusCode.getMessage(404, 'HTTP/1.1'), res, 404, ['User Not Found']);
            return;
        }

        const isMatch = commonFunc.compareHash(req.body.password, user.password);
        // Check password
        if (!isMatch) {
            errors.push(constant.Errormessage.incorrectPassword);
            func.sendErrorMessage(HTTPStatusCode.getMessage(400, 'HTTP/1.1'), res, 400, errors);
            return;
        }
        let hash = commonFunc.getHash(req.body.newPassword);
        await User.findOneAndUpdate({ _id: req.user._id }, { password: hash }, { upsert: true });

        func.sendSuccessData('', constant.message.passwordUpdated, res, 200);

    } catch (err) {
        console.log(err);
        if (err.name === 'ValidationError') {
            let errors = [];

            Object.keys(err.errors).forEach((key) => {
                errors.push(err.errors[key].message);
            });

            return func.sendErrorMessage(HTTPStatusCode.getMessage(400, 'HTTP/1.1'), res, 400, errors);

        }
        return func.sendErrorMessage(HTTPStatusCode.getMessage(500, 'HTTP/1.1'), res, 500, [constant.Errormessage.InternalServerError]);
    }
};

/**
 * Change Temporary Password
 * @param {{body:{newPassword:string,confirmPassword:string}}} req
 * @param res
 * @param cb
 * @returns {Promise<void>}
 */
exports.changeTempPassword = async (req, res, cb) => {
    const { errors, isValid } = validateChangePassword(req.body, false);

    if (!isValid) {
        func.sendErrorMessage(HTTPStatusCode.getMessage(400, 'HTTP/1.1'), res, 400, errors);
        return;
    }

    const user = await getUserById(req.user.userId);

    // Check User
    if (!user) {
        func.sendErrorMessage(HTTPStatusCode.getMessage(404, 'HTTP/1.1'), res, 404, ['User Not Found']);
        return;
    }

    await User.findOneAndUpdate({ _id: req.user.userId }, { password: req.body.newPassword }, { upsert: true });

    func.sendSuccessData('', constant.message.passwordUpdated, res, 200);
};

exports.myProfile = async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.user._id,
            isActive: true,
            isDeleted: false,
        }).select('-password');
        if (!user) {
            func.sendErrorMessage(HTTPStatusCode.getMessage(404, 'HTTP/1.1'), res, 404, ['User Not Found']);
            return;
        }
        func.sendSuccessData(user, constant.message.requestSuccess, res, 200);
    } catch (err) {
        console.log(err);
        if (err.name === 'ValidationError') {
            let errors = [];

            Object.keys(err.errors).forEach((key) => {
                errors.push(err.errors[key].message);
            });

            return func.sendErrorMessage(HTTPStatusCode.getMessage(400, 'HTTP/1.1'), res, 400, errors);

        }
        return func.sendErrorMessage(HTTPStatusCode.getMessage(500, 'HTTP/1.1'), res, 500, [constant.Errormessage.InternalServerError]);
    }
};

exports.updateMyProfile = async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.user._id,
            isActive: true,
            isDeleted: false,
        });
        if (!user) {
            func.sendErrorMessage(HTTPStatusCode.getMessage(404, 'HTTP/1.1'), res, 404, ['User Not Found']);
            return;
        }
        const { errors, isValid } = validateUserProfile(req.body, false);

        if (!isValid) {
            func.sendErrorMessage(HTTPStatusCode.getMessage(400, 'HTTP/1.1'), res, 400, errors);
            return;
        }

        const updatedUser = await User.findOneAndUpdate({ _id: req.user._id }, {
            $set: {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
            },
        }, { new: true, upsert: true });
        func.sendSuccessData(updatedUser, 'Profile Updated Successfully', res, 200);
    } catch (err) {
        console.log(err);
        if (err.name === 'ValidationError') {
            let errors = [];

            Object.keys(err.errors).forEach((key) => {
                errors.push(err.errors[key].message);
            });

            return func.sendErrorMessage(HTTPStatusCode.getMessage(400, 'HTTP/1.1'), res, 400, errors);

        }
        return func.sendErrorMessage(HTTPStatusCode.getMessage(500, 'HTTP/1.1'), res, 500, [constant.Errormessage.InternalServerError]);
    }
};
