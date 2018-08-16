/*
 * Helper functions
 */

// dependencies
const crypto = require('crypto')
const config = require('./config')
const validate = require('./validate')

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

// create a string of random hexadecimal characters of a given length
helpers.createRandomString = function (strLength) {
    strLength = validate.positiveNumberValidator(strLength)
    // generate a random string. string will be twice as long as value passed to randomBytes, so divide by 2. ex: 20 bytes is 40 hex characters
    return strLength && crypto.randomBytes(strLength / 2).toString('hex')
}

module.exports = helpers