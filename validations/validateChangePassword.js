const validator = require('validator')
const isEmpty = require('./isEmpty')

exports.validateChangePassword = (data, isTemp = true) => {
    let errors = []
    data.newPassword = !isEmpty(data.newPassword) ? data.newPassword : ""
    data.confirmPassword = !isEmpty(data.confirmPassword) ? data.confirmPassword : ""
    data.password = !isEmpty(data.password) ? data.password : ""

    if (!isTemp) {
        if (validator.isEmpty(data.password)) {
            errors.push("Password is required")
        }
    }
    if (validator.isEmpty(data.newPassword)) {
        errors.push("New Password is required")
    }

    if (validator.isEmpty(data.confirmPassword)) {
        errors.push("Confirm Password is required")
    }

    if (data.newPassword !== data.confirmPassword) {
        errors.push("Password and confirm Password should be same")
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}
