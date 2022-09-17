const validator = require('validator')
const isEmpty = require('./isEmpty')

exports.validateLogin = (data, validatePasword = true, validateSocialToken = false) => {
    let errors = []
    data.emailId = !isEmpty(data.emailId) ? data.emailId : ""
    data.password = !isEmpty(data.password) ? data.password : ""
    data.socialType = !isEmpty(data.socialType) ? data.socialType : ""
    data.socialToken = !isEmpty(data.socialToken) ? data.socialToken : ""

    if (validatePasword && validator.isEmpty(data.emailId)) {
        errors.push("Email Address is required")
    }

    if (!validator.isEmpty(data.emailId)) {
        if (!validator.isEmail(data.emailId)) {
            errors.push("Enter valid email address")
        }
    }

    if (validatePasword && validator.isEmpty(data.password)) {
        errors.push("Password is required")
    }

    if (validateSocialToken && validator.isEmpty(data.socialType)) {
        errors.push("Social Type is required")
    }

    if (validateSocialToken && validator.isEmpty(data.socialToken)) {
        errors.push("Social Token is required")
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}
