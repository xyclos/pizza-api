/*
 * Helper functions
 */

// dependencies
const crypto = require('crypto')
const config = require('./config')

// container
const helpers = {}

// hash passwords (sha 256)
helpers.hash = function (str) {
    if (typeof(str) === 'string' && str.length) {
        return crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex')
    } else {
        return null
    }
}

// parse a json string to an object in all cases without throwing
helpers.parseJsonToObject = function (str) {
    let object = {}
    try {
        object = JSON.parse(str)
    } catch (e) {
        console.error('Error while attempting parsing to json: ', str, e)
    }
    return object
}

module.exports = helpers