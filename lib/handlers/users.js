/*
 * Handlers for users routes
 */

const _data = require('../data')
const _helpers = require('../helpers')
const validate = require('../validate')
const tokens = require('./tokens')

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
    const streetAddress = validate.stringValidator(data.payload.streetAddress)
    const emailAddress = validate.stringValidator(data.payload.emailAddress)

    if (firstName && lastName && phone && password && tosAgreement && streetAddress && emailAddress) {
        const id = _helpers.createRandomString(20)
        // make sure that the user doesn't already exist
        _data.read('users', id, (err) => {
            if (err) {
                // hash the password
                const hashedPassword = _helpers.hash(password)

                if (hashedPassword) {
                    // create the user object
                    const userObject = {id, firstName, lastName, phone, hashedPassword, tosAgreement, streetAddress, emailAddress}

                    // persist the user
                    _data.create('users', id, userObject,
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
handlers.get = function (data, callback) {
    // check that the phone number is valid
    const id = validate.phoneValidator(data.queryStringObject.id)
    if (id) {
        // get the token from the headers
        const token = validate.stringOfLengthValidator(data.headers.token, 20)

        // verify the given token is valid for the phone number
        tokens.verifyToken(token, id, (tokenIsValid) => {
            if (tokenIsValid) {
                _data.read('users', id, (err, data) => {
                    if (!err && data) {
                        // remove the hashed password from the hashed password before returning it to the requester
                        delete data.hashedPassword
                        callback(200, data)
                    } else {
                        callback(404)
                    }
                })
            } else {
                callback(403, {'Error': 'Forbidden'})
            }
        })
    } else {
        callback(400, {'Error': 'Missing required field'})
    }
}

// Users - Put
// required data: phone
// optional data: firstName, lastName, password (at least one must be specified)
handlers.put = function (data, callback) {
    let {id, phone, firstName, lastName, password, streetAddress, emailAddress} = data.payload
    phone = validate.phoneValidator(phone)
    firstName = validate.stringValidator(firstName)
    lastName = validate.stringValidator(lastName)
    password = validate.passwordValidator(password)
    streetAddress = validate.stringValidator(streetAddress)
    emailAddress = validate.stringValidator(emailAddress)
    id = validate.stringValidator(id)

    if (id) {
        if (firstName || lastName || password || emailAddress || streetAddress) {
            const token = validate.stringOfLengthValidator(data.headers.token, 20)

            tokens.verifyToken(token, id, (tokenIsValid) => {
                if (tokenIsValid) {
                    // lookup the user
                    _data.read('users', id, (err, userData) => {
                        if (!err && userData) {
                            if (firstName) { userData.firstName = firstName }
                            if (lastName) { userData.lastName = lastName }
                            if (password) { userData.hashedPassword = _helpers.hash(password) }
                            if (streetAddress) { userData.streetAddress = streetAddress }
                            if (emailAddress) { userData.emailAddress = emailAddress }
                            if (phone) { userData.phone = phone }
                            // store the updates
                            _data.update('users', id, userData, (err) => {
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
                    callback(403, {'Error': 'Forbidden'})
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
// @TODO cleanup any other data associated with this user
handlers.delete = function (data, callback) {
    const id = validate.stringValidator(data.queryStringObject.id)

    if (id) {
        const token = validate.stringOfLengthValidator(data.headers.token, 20)

        tokens.verifyToken(token, id, (tokenIsValid) => {
            if (tokenIsValid) {
                _data.read('users', id, (err, data) => {
                    if (!err && data) {
                        _data.delete('users', id, (err) => {
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
                callback(403, {'Error': 'Forbidden'})
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