/*
* Primary file for the api
*
*/

// Dependencies
const http = require('http')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder

const config = require('./config')

// the server should respond to all requests with a string
const server = http.createServer((req, res) => {

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
})

// start the server, and have it listen on the configured port
server.listen(config.port, () => console.log(
    `The server is listening on port ${config.port} for environment ${config.envName}`))

// define some handlers
const handlers = {}

handlers.sample = function(data, callback) {
    // callback a http status code, and a payload object
    callback(406, {'name': 'sample handler'})
}

handlers.notFound = function(data, callback) {
    callback(404)
}

// define a request router
const router = {
    'sample': handlers.sample
}