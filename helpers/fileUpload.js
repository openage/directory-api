'use strict'
const formidable = require('formidable')
const path = require('path')
const rootPath = path.normalize(__dirname + './../')

exports.withFileForm = async (req) => {
    req.context.logger.start('withFileForm')
    var form = new formidable.IncomingForm()
    form.uploadDir = rootPath + 'temp'
    form.keepExtensions = false
    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) { return reject(err) }
            return resolve(files)
        })
    })
}
