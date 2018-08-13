/*
* Primary file for the api
*
*/

// Dependencies
const http = require('http')
const https = require('https')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder
const fs = require('fs')

const config = require('./config')

// instantiate the http server
const httpServer = http.createServer((req, res) => unifiedServer(req, res))

// instantiate the https server
const httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
}
const httpsServer = https.createServer(httpsServerOptions, (req, res) => unifiedServer(req, res))
// start the https server

// start the server, and have it listen on the configured port
httpServer.listen(config.httpPort, () => console.log(
    `The server is listening on port ${config.httpPort} for environment ${config.envName}`))

httpsServer.listen(config.httpsPort, () => console.log(
    `The server is listening on port ${config.httpsPort} for environment ${config.envName}`))

const unifiedServer = function(req, res) {
    // get the url and parse it
    const parsedUrl = url.parse(req.url, true)

    // get the path from the url
    const path = parsedUrl.pathname
    const trimmedPath = path.replace(/^\/+|\/+$/g, '')

    // get the query string as an object
    const queryStringObject = parsedUrl.query

    // get the http method
    const method = req.method.toLowerCase()

    // get the headers as an object
    const headers = req.headers

    // get the payload, if any
    const decoder = new StringDecoder('utf-8')
    let buffer = ''
    req.on('data', (data) => buffer += decoder.write(data))
    req.on('end', () => {
        buffer += decoder.end()

        // choose the handler this request should go to.
        // if one is not found, use the notFound handler
        const chosenHandler = router.hasOwnProperty(trimmedPath) ? router[trimmedPath] : handlers.notFound

        // construct the data object to send to the header
        const data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': buffer
        }

        // route the request specified by the router
        chosenHandler(data,(status,payload) => {
            // use the status code called back by the handler, or default to 200
            status = typeof(status) === 'number' ? status : 200
            // use the payload called back by the handler, or default to empty object
            payload = typeof(payload) === 'object' ? payload : {}

            // convert the payload to a string
            const payloadString = JSON.stringify(payload)

            // return the response
            res.setHeader('Content-Type', 'application/json')
            res.writeHead(status)
            res.end(payloadString)

            console.log('returning this response', status, payload)
        })
    })
}

// define some handlers
const handlers = {}

handlers.hello = function(data, callback) {
    const userAgent = data.headers['user-agent']
    callback(200, { userAgent })
}

handlers.ping = function(data, callback) {
    callback(200)
}

handlers.notFound = function(data, callback) {
    callback(404)
}

// define a request router
const router = {
    'ping': handlers.ping,
    'hello': handlers.hello
}