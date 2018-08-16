/*
 * Request handlers
 */

// dependencies
const _usersHandler = require('./users')
const _tokensHandler = require('./tokens')

// index container
const handler = {}

handler.users = _usersHandler.handle
handler.tokens = _tokensHandler.handle

handler.ping = function(data, callback) {
    callback(200)
}

handler.notFound = function(data, callback) {
    callback(404)
}

module.exports = handler