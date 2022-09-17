const validator = require('validator')
const isEmpty = require('./isEmpty')

exports.validateUserProfile = (data) => {
    let errors = []
    data.firstName = !isEmpty(data.firstName) ? data.firstName : ""
    data.lastName = !isEmpty(data.lastName) ? data.lastName : ""

    if (validator.isEmpty(data.firstName)) {
        errors.push("First Name is required")
    }

    if (validator.isEmpty(data.lastName)) {
        errors.push("Last Name is required")
    }


    return {
        errors,
        isValid: isEmpty(errors)
    }
}
