/*
 * library for storing and editing data
 */

const fs = require('fs')
const path = require('path')

const helpers = require('./helpers')

// container for the module to be exported
const lib = {}

// base directory of the data folder
lib.baseDir = path.join(__dirname, '/../.data')

// write data to a file
lib.create = function (dir, file, data, callback) {
    // open the file for writing
    fs.open(`${lib.baseDir}/${dir}/${file}.json`,'wx',(err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            // convert data to a string
            const stringData = JSON.stringify(data)

            // write to file and close it
            fs.writeFile(fileDescriptor, stringData, (err) => {
                if (!err) {
                    fs.close(fileDescriptor, (err) => {
                        if (!err) {
                            callback(null)
                        } else {
                            callback('Error closing the file')
                        }
                    })
                } else {
                    callback('Error writing to new file')
                }
            })
        } else {
            callback('Could not create new file, it may already exist')
        }
    })
}

// read data from a file
lib.read = function (dir, file, callback) {
    fs.readFile(`${lib.baseDir}/${dir}/${file}.json`, 'utf8', (err, data) => {
        if (!err && data) {
            const parsedData = helpers.parseJsonToObject(data)
            callback(null, parsedData)
        } else {
            callback(err, data)
        }
    })
}

// update data in file
lib.update = function (dir, file, data, callback) {
    // open the file for writing
    fs.open(`${lib.baseDir}/${dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            const stringData = JSON.stringify(data)

            fs.truncate(fileDescriptor, (err) => {
                if (!err) {
                    // write to the file and close it
                    fs.writeFile(fileDescriptor, stringData, (err) => {
                        if (!err) {
                            fs.close(fileDescriptor, (err) => {
                                if (!err) {
                                    callback(null)
                                } else {
                                    callback('Error closing the file')
                                }
                            })
                        } else {
                            callback('Error writing to existing file')
                        }
                    })
                } else {
                    callback('Error truncating file')
                }
            })
        } else {
            callback('Could not open the file for updating, it may not exist')
        }
    })
}

lib.delete = function (dir, file, callback) {
    // unlink the file
    fs.unlink(`${lib.baseDir}/${dir}/${file}.json`, (err) => callback(err))
}


// export the module
module.exports = lib
