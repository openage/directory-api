'use strict'
var auth = require('../helpers/auth')
var apiRoutes = require('@open-age/express-api')
var fs = require('fs')
var loggerConfig = require('config').get('logger')
var appRoot = require('app-root-path')

const specs = require('../specs')

module.exports.configure = (app, logger) => {
    logger.start('settings:routes:configure')

    let specsHandler = function (req, res) {
        fs.readFile('./public/specs.html', function (err, data) {
            if (err) {
                res.writeHead(404)
                res.end()
                return
            }
            res.contentType('text/html')
            res.send(data)
        })
    }

    app.get('/', specsHandler)

    app.get('/swagger', (req, res) => {
        res.writeHeader(200, {
            'Content-Type': 'text/html'
        })
        fs.readFile('./public/swagger.html', null, function (err, data) {
            if (err) {
                res.writeHead(404)
                res.end()
                return
            }
            res.write(data)
            res.end()
        })
    })

    app.get('/specs', specsHandler)

    app.get('/api/specs', function (req, res) {
        res.contentType('application/json')
        res.send(specs.get())
    })

    app.get('/logs', function (req, res) {
        var filePath = appRoot + '/' + loggerConfig.file.filename

        fs.readFile(filePath, function (err, data) {
            if (err) {
                res.writeHead(404)
                res.end()
                return
            }
            res.contentType('application/json')
            res.send(data)
        })
    })

    var api = apiRoutes(app)

    api.model('tenants').register('REST')
    api.model('dependents')
        .register([{
            action: 'POST',
            method: 'create',
            filter: auth.requireRoleKey
        }, {
            action: 'POST',
            method: 'bulk',
            url: '/bulk',
            filter: auth.requireRoleKey
        }])
    api.model('users')
        .register([{
                action: 'POST',
                method: 'create',
                filter: auth.requiresTenantCode
            }, {
                action: 'POST',
                method: 'verifyOtp',
                url: '/confirm',
                filter: auth.requiresTenantCode
            }, {
                action: 'POST',
                method: 'resendOtp',
                url: '/resend',
                filter: auth.requiresTenantCode
            }, {
                action: 'PUT',
                method: 'update',
                url: '/:id',
                filter: auth.requireRoleKey
            }, {
                action: 'GET',
                method: 'get',
                url: '/:id',
                filter: auth.requireRoleKey
            },
            {
                action: 'GET',
                method: 'search',
                filter: auth.requireRoleKey
            }
        ])
    api.model('roles').register([{
        action: 'POST',
        method: 'create',
        filter: auth.requireRoleKey
    }, {
        action: 'GET',
        method: 'get',
        url: '/:id',
        filter: auth.requireRoleKey
    }, {
        action: 'GET',
        method: 'search',
        filter: auth.requireRoleKey
    }, {
        action: 'PUT',
        method: 'update',
        url: '/:id',
        filter: auth.requireRoleKey
    }, {
        action: 'POST',
        method: 'codeAvailable',
        url: '/isAvailable',
        filter: auth.requireRoleKey
    }])
    api.model('organizations')
        .register([{
            action: 'POST',
            method: 'create',
            filter: auth.requireRoleKey
        }, {
            action: 'GET',
            method: 'get',
            url: '/:id',
            filter: auth.requireRoleKey
        }, {
            action: 'GET',
            method: 'search',
            filter: auth.requireRoleKey
        }, {
            action: 'PUT',
            method: 'update',
            url: '/:id',
            filter: auth.requireRoleKey
        }, {
            action: 'POST',
            method: 'codeAvailable',
            url: '/isAvailable',
            filter: auth.requireRoleKey
        }])

    api.model('employees')
        .register([{
            action: 'POST',
            method: 'create',
            filter: auth.requireRoleKey
        }, {
            action: 'GET',
            method: 'get',
            url: '/:id',
            filter: auth.requireRoleKey
        }, {
            action: 'DELETE',
            method: 'delete',
            url: '/:id',
            filter: auth.requireRoleKey
        }, {
            action: 'GET',
            method: 'search',
            filter: auth.requireRoleKey
        }, {
            action: 'PUT',
            method: 'update',
            url: '/:id',
            filter: auth.requireRoleKey
        }, {
            action: 'POST',
            method: 'bulkUpload',
            url: '/bulk',
            filter: auth.requireRoleKey
        }])

    api.model({
        root: 'roleTypes',
        controller: 'role-types'
    }).register('REST', auth.requireRoleKey)
    api.model('departments').register('REST', auth.requireRoleKey)
    api.model('divisions').register('REST', auth.requireRoleKey)
    api.model('designations').register('REST', auth.requireRoleKey)
    api.model('sessions').register([{
        action: 'POST',
        method: 'create',
        filter: auth.requiresTenantCode
    }, {
        action: 'GET',
        method: 'get',
        url: '/:id',
        filter: auth.requiresTenantCode
    }, {
        action: 'PUT',
        method: 'update',
        url: '/:id',
        filter: auth.requireRoleKey
    }])
    api.model({
        root: 'activityLogs',
        controller: 'activity-logs'
    }).register('REST', auth.requireRoleKey)
    logger.end()
}
