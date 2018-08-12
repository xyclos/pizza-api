/*
* create and export config variables
*
 */

// container for all the environments
const environments = {}

// staging object (default)
environments.staging = {
    'port': 3000,
    'envName': 'staging'
}

// prod
environments.production = {
    'port': 5000,
    'envName': 'production'
}

const currentEnvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : ''

const environmentToExport = environments.hasOwnProperty(currentEnvironment) ?
    environments[currentEnvironment] : environments.staging

module.exports = environmentToExport

