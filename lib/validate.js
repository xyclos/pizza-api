/*
 * Data validation lib
 */

const validate = {}

validate.stringValidator = function (str) {
    return typeof(str) === 'string' && str.trim().length > 0 ? str.trim() : false
}

validate.phoneValidator = function (phone) {
    return typeof(phone) === 'string' && phone.trim().length === 10 ? phone.trim() : false
}

validate.passwordValidator = function (pw) {
    return validate.stringValidator(pw)
}

validate.booleanValidator = function (bool) {
    return typeof(bool) === 'boolean' && bool === true
}

module.exports = validate