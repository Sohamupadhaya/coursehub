const validator = require('validator')
const isEmpty = require('./isEmpty')

exports.validateRegisterUser = (data, validatePasword = false, validateSocialToken = false) => {
    let errors = []
    data.firstName = !isEmpty(data.firstName) ? data.firstName : ""
    data.lastName = !isEmpty(data.lastName) ? data.lastName : ""
    data.emailId = !isEmpty(data.emailId) ? data.emailId : ""
    data.password = !isEmpty(data.password) ? data.password : ""
    data.mobileNumber = !isEmpty(data.mobileNumber) ? data.mobileNumber : ""
    data.countryCode = !isEmpty(data.countryCode) ? data.countryCode : ""
    data.socialToken = !isEmpty(data.socialToken) ? data.socialToken : ""
    data.socialType = !isEmpty(data.socialType) ? data.socialType : ""

    if (validator.isEmpty(data.firstName)) {
        errors.push("First Name is required")
    }
    if (validator.isEmpty(data.lastName)) {
        errors.push("Last Name is required")
    }

    if (validator.isEmpty(data.emailId)) {
        errors.push("Email Address is required")
    }

    if (!validator.isEmpty(data.emailId)) {
        if (!validator.isEmail(data.emailId)) {
            errors.push("Enter valid email address")
        }
    }

    if (validator.isEmpty(data.countryCode)) {
        errors.push("Country Code is required")
    }

    if (validatePasword && validator.isEmpty(data.mobileNumber)) {
        errors.push("Mobile Number is required")
    }

    if (validatePasword) {
        if (validator.isEmpty(data.password)) {
            errors.push("Password is required")
        }
    }

    if (validateSocialToken) {
        if (validator.isEmpty(data.socialToken)) {
            errors.push("Social Token is required")
        }
    }

    if (validator.isEmpty(data.socialType)) {
        errors.push("Social Type is required")
    }
    return {
        errors,
        isValid: isEmpty(errors)
    }
}
