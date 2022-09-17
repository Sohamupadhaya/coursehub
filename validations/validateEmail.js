const validator = require('validator')
const isEmpty = require('./isEmpty')

exports.validateEmail = (data) => {
    let errors = []
    data.emailId = !isEmpty(data.emailId) ? data.emailId : ""

    if (validator.isEmpty(data.emailId)) {
        errors.push("Email Address is required")
    }

    if (!validator.isEmpty(data.emailId)) {
        if (!validator.isEmail(data.emailId)) {
            errors.push("Enter valid email address")
        }
    }


    return {
        errors,
        isValid: isEmpty(errors)
    }
}
