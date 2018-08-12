/*
* create and export config variables
*
 */

// container for all the environments
const environments = {}

// staging object (default)
environments.staging = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'envName': 'staging'
}

// prod
environments.production = {
    'httpPort': 5000,
    'httpsPort': 5001,
    'envName': 'production'
}

const currentEnvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : ''

const environmentToExport = environments.hasOwnProperty(currentEnvironment) ?
    environments[currentEnvironment] : environments.staging

module.exports = environmentToExport

