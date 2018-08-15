/*
 * Handlers for users routes
 */

const _data = require('../data')
const _helpers = require('../helpers')
const validate = require('../validate')

const handlers = {}

// users - post
// required fields: firstName, lastName, phone, password, tosAgreement
// optional data: none
handlers.post = function (data, callback) {
    // check that all required fields are filled out
    const firstName = validate.stringValidator(data.payload.firstName)
    const lastName = validate.stringValidator(data.payload.lastName)
    const phone = validate.phoneValidator(data.payload.phone)
    const password = validate.passwordValidator(data.payload.password)
    const tosAgreement = validate.booleanValidator(data.payload.tosAgreement)

    if (firstName && lastName && phone && password && tosAgreement) {
        // make sure that the user doesn't already exist
        _data.read('users', phone, (err) => {
            if (err) {
                // hash the password
                const hashedPassword = _helpers.hash(password)

                if (hashedPassword) {
                    // create the user object
                    const userObject = {firstName, lastName, phone, hashedPassword, tosAgreement}

                    // persist the user
                    _data.create('users', phone, userObject,
                        (err) => !err ? callback(200) : callback(500, {'Error': 'Could not persist the user'})
                    )
                } else {
                    callback(500, {'Error': 'Could not hash the user\'s password'})
                }
            } else {
                // user already exists
                callback(400, {'Error': 'User with that phone number already exists'})
            }
        })
    } else {
        callback(400, {'Error': 'Missing required fields'})
    }
}

// Users - get
// required data: phone
// optional data: none
// @TODO only let an authenticated user access their object, don't allow access to others' objects
handlers.get = function (data, callback) {
    // check that the phone number is valid
    const phone = validate.phoneValidator(data.queryStringObject.phone)
    if (phone) {
        _data.read('users', phone, (err, data) => {
            if (!err && data) {
                // remove the hashed password from the hashed password before returning it to the requester
                delete data.hashedPassword
                callback(200, data)
            } else {
                callback(404)
            }
        })
    } else {
        callback(400, {'Error': 'Missing required field'})
    }
}

// Users - Put
// required data: phone
// optional data: firstName, lastName, password (at least one must be specified)
// @TODO only let an authenticated user update their own object, don't let them update anyone else
handlers.put = function (data, callback) {
    let {phone, firstName, lastName, password} = data.payload
    phone = validate.phoneValidator(phone)
    firstName = validate.stringValidator(firstName)
    lastName = validate.stringValidator(lastName)
    password = validate.passwordValidator(password)

    if (phone) {
        if (firstName || lastName || password) {
            // lookup the user
            _data.read('users', phone, (err, userData) => {
                if (!err && data) {
                    if (firstName) { userData.firstName = firstName }
                    if (lastName) { userData.lastName = lastName }
                    if (password) { userData.hashedPassword = _helpers.hash(password) }
                    // store the updates
                    _data.update('users', phone, userData, (err) => {
                        if (err) {
                            console.error(err)
                            callback(500, {'Error': 'Could not update user'})
                        } else {
                            callback(200)
                        }
                    })
                } else {
                    callback(409, {'Error': 'The specified user was not found'})
                }
            })
        } else {
            callback(400, {'Error': 'Missing field to update'})
        }
    } else {
        callback(400, {'Error': 'Missing required field'})
    }
}

// Users - delete
// required data: phone
// optional data: none
// @TODO only let an authenticated user delete their own data, don't let them delete someone else
// @TODO cleanup any other data associated with this user
handlers.delete = function (data, callback) {
    const phone = validate.phoneValidator(data.queryStringObject.phone)

    if (phone) {
        _data.read('users', phone, (err, data) => {
            if (!err && data) {
                _data.delete('users', phone, (err) => {
                    if (err) {
                        callback(500, {'Error': 'Could not delete the user'})
                    } else {
                        callback(200)
                    }
                })
            } else {
                callback(409, {'Error': 'The specified user was not found'})
            }
        })
    } else {
        callback(400, {'Error': 'Missing required field'})
    }
}

handlers.handle = function (data, callback) {
    const acceptableMethods = ['post', 'get', 'put', 'delete']
    if (acceptableMethods.includes(data.method)) {
        handlers[data.method](data,callback)
    } else {
        callback(405)
    }
}

module.exports = handlers