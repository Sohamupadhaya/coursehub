const validator = require('validator')
const isEmpty = require('./isEmpty')

exports.validateResetPassword = (data) => {
    let errors = []
    data.password = !isEmpty(data.password) ? data.password : ""
    data.confirmPassword = !isEmpty(data.confirmPassword) ? data.confirmPassword : ""

    if (validator.isEmpty(data.password)) {
        errors.push("Password is required")
    }

    if (validator.isEmpty(data.confirmPassword)) {
        errors.push("Confirm Password is required")
    }

    if (data.password !== data.confirmPassword) {
        errors.push("Password and confirm Password should be same")
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}
