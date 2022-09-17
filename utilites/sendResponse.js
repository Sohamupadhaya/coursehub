const isEmpty = require("../validations/isEmpty");
const HTTPStatusCode = require('http-status-code')
const constant = require('../config/constant');

exports.invalidAccessTokenError = function (res) {
    var errResponse = {
        status: constant.responseStatus.INVALID_ACCESS_TOKEN,
        message: constant.responseMessage.INVALID_ACCESS_TOKEN,
        data: {},
        relogin: true,
    };
    sendData(errResponse, res);
};

exports.parameterMissingError = function (res) {
    var errResponse = {
        status: constant.responseStatus.PARAMETER_MISSING,
        message: constant.responseMessage.PARAMETER_MISSING,
        data: {},
    };
    sendData(errResponse, res);
};

exports.joiParameterMissingError = function (res, err) {
    var errResponse = {
        status: 400,
        // message: constant.responseMessage.PARAMETER_MISSING,
        message: err.message,
        data: {},
        error: err,
    };
    sendData(errResponse, res);
};

exports.somethingWentWrongError = function (res, err = {}) {
    var errResponse = {
        status: constant.responseStatus.ERROR_IN_EXECUTION,
        message: constant.responseMessage.ERROR_IN_EXECUTION,
        data: {},
        error: err,
    };
    sendData(errResponse, res);
};

exports.sendErrorMessage = function (msg, res, status, err = {}) {
    const errResponse = {
        status: status,
        message: msg,
        error: err,
    };
    if (status === 401) {
        errResponse.relogin = true;
    }
    sendData(errResponse, res);
};

exports.sendSuccessData = function (data, message, res, status) {
    const successResponse = {
        status: status,
        message: message,
        data: data,
    };
    if (!isEmpty(data)) {
        successResponse.data = data
    }
    if (status === 2) {
        successResponse.relogin = true;
    }
    sendData(successResponse, res);
};

exports.sendSuccessData204 = function (data, message, res, status) {
    var successResponse = {
        status: status,
        message: message,
        data: data,
    };
    // sendData(successResponse,res);

    res.status(204).send(successResponse);
};

exports.sendSuccessDataWithVariant = function (
    data,
    brands,
    message,
    res,
    status
) {
    var successResponse = {
        status: status,
        message: message,
        data: data,
        brands: brands,
    };
    sendData(successResponse, res);
};

exports.sendSuccessDataForApp = function (data, message, res) {
    var successResponse = {
        status: 200,
        message: message,
        data: data,
    };
    sendData(successResponse, res);
};

exports.unauthorizedCustomer = function (res) {
    var Response = {
        status: 403,
        message: HTTPStatusCode.getMessage(403),
        err: [constant.Errormessage.accessDenied],
        data: {},
    };
    sendData(Response, res);
};

exports.duplicateCategory = function (res) {
    var Response = {
        status: constant.responseStatus.SOME_ERROR,
        message: constant.responseMessage.DUPLICATE_ENTRY_FOR_CATEGORY,
        data: {},
    };
    sendData(Response, res);
};

function sendData(data, res) {
    //res.type('json');
    res.status(data.status).send(data);
}
