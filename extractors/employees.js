'use strict'
const csv = require('fast-csv')
const fs = require('fs')

exports.extract = (file, context) => {
    context.logger.start('extract')

    const stream = fs.createReadStream(file.path)

    const parseData = []

    return new Promise((resolve, reject) => {
        csv.fromStream(stream, { headers: true, ignoreEmpty: true })
            .on('data', data => parseData.push(data))
            .on('end', () => {
                return resolve(parseData)
            })
    })
}
