/*
 * Request index
 */

// dependencies
const _usersHandler = require('./users')

// index container
const index = {}

index.users = _usersHandler.handle

index.hello = function(data, callback) {
    const userAgent = data.headers['user-agent']
    callback(200, { userAgent })
}

index.ping = function(data, callback) {
    callback(200)
}

index.notFound = function(data, callback) {
    callback(404)
}

module.exports = index