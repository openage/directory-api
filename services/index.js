'use strict'
let fs = require('fs')
const changeCase = require('change-case')

let services = {}
let init = function () {
    fs.readdirSync(__dirname).forEach(function (file) {
        if (file.indexOf('.js') && file.indexOf('index.js') < 0) {
            let service = require('./' + file)
            let name = file.substring(0, file.indexOf('.js'))
            services[name] = service

            services[name] = service
            services[changeCase.camelCase(name)] = service
        }
    })
}

init()

module.exports = services
