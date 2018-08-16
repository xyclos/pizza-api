/*
 * Handlers for tokens routes
 */

// dependencies
const _data = require('../data')
const _helpers = require('../helpers')
const validate = require('../validate')

const tokens = {}

// Tokens - get
// required data: id
// optional data: none
tokens.get = function (data, callback) {
    const id = data.queryStringObject.id
    if (id) {
        _data.read('tokens', id, (err, data) => {
            if (!err && data) {
                callback(200, data)
            } else {
                callback(404)
            }
        })
    } else {
        callback(400, {'Error': 'Missing required field'})
    }
}

// Tokens - post
// required data: phone, password
// optional data: none
tokens.post = function (data, callback) {
    const phone = validate.phoneValidator(data.payload.phone)
    const password = validate.passwordValidator(data.payload.password)
    if (phone && password) {
        // lookup the user who matches that phone number
        _data.read('users', phone, (err, userData) => {
            if (!err && userData) {
                // hash the sent password
                const hashedPassword = _helpers.hash(password)
                if (hashedPassword === userData.hashedPassword) {
                    // if valid create a new token with a rnadom name. Set expiration for 1 hour
                    const id = _helpers.createRandomString(20) // token id
                    const expires = Date.now() + 1000 * 60 * 60
                    const tokenObject = { id, phone, expires}
                    _data.create('tokens', id, tokenObject, (err) => {
                        if (!err) {
                            callback(200, tokenObject)
                        } else {
                            callback(500, {'Error': 'Could not create new token'})
                        }
                    })
                } else {
                    callback(400, {'Error': 'Password did not match the specified user\'s stored password'})
                }
            } else {
                callback(409, {'Error': 'Could not find the specified user'})
            }
        })
    } else {
        callback(400, {'Error': 'Missing required fields'})
    }
}

// Tokens - put
// required data: id
// optional data: none
tokens.put = function (data, callback) {
    const id = validate.stringOfLengthValidator(data.payload.id, 20)

    if (id) {
        _data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                const now = Date.now()
                // check that token has not expired and extend if not expired
                if (tokenData.expires > now) {
                    tokenData.expires = now + 1000 * 60 * 60
                    _data.update('tokens', id, tokenData, (err) => {
                        if (!err) {
                            callback(200)
                        } else {
                            callback(500, {'Error': 'Could not update token'})
                        }
                    })
                }

            } else {
                callback(409, {'Error': 'Could not find specified token'})
            }
        })
    } else {
        callback(400, {'Error': 'Missing required field'})
    }
}

// Tokens - delete
// required data: id
// optional data: none
tokens.delete = function (data, callback) {
    const id = validate.stringOfLengthValidator(data.queryStringObject.id, 20)

    if (id) {
        _data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                _data.delete('tokens', id, (err) => {
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

// verify if a given token id is currently valid for a given user
tokens.verifyToken = function (id, phone, callback) {
    _data.read('tokens', id, (err, tokenData) => {
        if (!err && tokenData) {
            // check that the token is for the given user and has not expired
            if (tokenData.phone === phone && tokenData.expires > Date.now()) {
                callback(true)
            } else {
                callback(false)
            }
        } else {
            callback(false)
        }
    })
}

tokens.handle = function (data, callback) {
    const methods = ['post', 'get', 'put', 'delete']
    if (methods.includes(data.method)) {
        tokens[data.method](data,callback)
    } else {
        callback(405)
    }
}

module.exports = tokens