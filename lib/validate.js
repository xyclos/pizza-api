/*
 * Data validation lib
 */

const validate = {}

// validates string, returns either the valid string that was passed in or false
validate.stringValidator = function (str) {
    return typeof(str) === 'string' && str.trim().length > 0 ? str.trim() : false
}

// validates string of certain length, returns either the valid string that was passed in or false
validate.stringOfLengthValidator = function (str, len) {
    return validate.stringValidator(str) && str.trim().length >= len ? str.trim() : false
}

// validates a phone number is exactly 10 digits, returns either the valid string that was passed in or false
validate.phoneValidator = function (phone) {
    return typeof(phone) === 'string' && phone.trim().length === 10 ? phone.trim() : false
}

// validates a password
// @TODO write real password validation instead of passing it to string validate
validate.passwordValidator = function (pw) {
    return validate.stringValidator(pw)
}

// validates a boolean, returns the valid boolean that was passed in or false
validate.booleanValidator = function (bool) {
    return typeof(bool) === 'boolean' && bool === true
}

// validates a positive number, returns the valid number that was passed in or false
validate.positiveNumberValidator = function (num) {
    return typeof(num) === 'number' && num > 0 ? num : false
}

module.exports = validate