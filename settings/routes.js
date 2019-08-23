'use strict'
const contextBuilder = require('../helpers/context-builder')
const apiRoutes = require('@open-age/express-api')
const fs = require('fs')

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

    app.get('/specs', specsHandler)

    app.get('/api/specs', function (req, res) {
        res.contentType('application/json')
        res.send(specs.get())
    })

    var api = apiRoutes(app, { context: { builder: contextBuilder.create } })

    api.model('tenants').register('REST')
    api.model('dependents')
        .register([{
            action: 'POST',
            method: 'create',
            permissions: 'tenant.user'
        }, {
            action: 'POST',
            method: 'bulk',
            url: '/bulk',
            permissions: 'tenant.user'
        }])
    api.model('users')
        .register([{
            action: 'GET',
            method: 'exists',
            url: '/exists',
            permissions: ['tenant.guest', 'tenant.user']
        }, {
            action: 'POST',
            method: 'signIn',
            url: '/signIn',
            permissions: ['tenant.guest', 'tenant.user']
        }, {
            action: 'POST',
            method: 'signUp',
            url: '/signUp',
            permissions: ['tenant.guest', 'tenant.user']
        }, {
            action: 'POST',
            method: 'create',
            permissions: ['tenant.guest', 'tenant.user']
        }, {
            action: 'POST',
            method: 'verifyOtp',
            url: '/confirm',
            permissions: ['tenant.guest', 'tenant.user']
        }, {
            action: 'POST',
            method: 'setPassword',
            url: '/setPassword',
            permissions: ['tenant.guest', 'tenant.user']
        }, {
            action: 'POST',
            method: 'setPassword',
            url: '/setPassword/:id',
            permissions: ['tenant.guest', 'tenant.user']
        }, {
            action: 'POST',
            method: 'resetPassword',
            url: '/resetPassword',
            permissions: 'tenant.user'
        }, {
            action: 'POST',
            method: 'changePassword',
            url: '/changePassword',
            permissions: 'tenant.user'
        }, {
            action: 'POST',
            method: 'resendOtp',
            url: '/resend',
            permissions: ['tenant.guest', 'tenant.user']
        }, {
            action: 'PUT',
            method: 'update',
            url: '/:id',
            permissions: 'tenant.user'
        }, {
            action: 'GET',
            method: 'get',
            url: '/:id',
            permissions: 'tenant.user'
        },
        {
            action: 'GET',
            method: 'search',
            permissions: 'tenant.user'
        }, {
            action: 'PUT',
            method: 'profile',
            url: '/:id/profile',
            permissions: 'tenant.user'
        }])

    api.model('roles')
        .register([{
            action: 'POST',
            method: 'create',
            permissions: 'tenant.user'
        }, {
            action: 'GET',
            method: 'get',
            url: '/:id',
            permissions: 'tenant.user'
        }, {
            action: 'GET',
            method: 'search',
            permissions: 'tenant.user'
        }, {
            action: 'PUT',
            method: 'update',
            url: '/:id',
            permissions: 'tenant.user'
        }, {
            action: 'POST',
            method: 'codeAvailable',
            url: '/isAvailable',
            permissions: 'tenant.user'
        }, {
            action: 'POST',
            method: 'createDependent',
            url: '/:id/dependent',
            permissions: 'tenant.user'
        }, {
            action: 'POST',
            method: 'createDependentsInBulk',
            url: '/:id/dependent/bulk',
            permissions: 'tenant.user'
        }])
    api.model('organizations')
        .register([{
            action: 'POST',
            method: 'create',
            permissions: 'tenant.user'
        }, {
            action: 'GET',
            method: 'get',
            url: '/:id',
            permissions: 'tenant.user'
        }, {
            action: 'GET',
            method: 'get',
            url: '/:code/summary',
            permissions: ['tenant.guest', 'tenant.user']
        }, {
            action: 'GET',
            method: 'search',
            permissions: 'tenant.user'
        }, {
            action: 'PUT',
            method: 'update',
            url: '/:id',
            permissions: 'tenant.user'
        }, {
            action: 'POST',
            method: 'codeAvailable',
            url: '/isAvailable',
            permissions: ['tenant.user', 'tenant.guest']
        }])

    api.model('employees')
        .register([{
            action: 'GET',
            method: 'exists',
            url: '/exists',
            permissions: ['tenant.guest', 'tenant.user']
        }, {
            action: 'POST',
            method: 'create',
            permissions: 'tenant.user'
        }, {
            action: 'GET',
            method: 'get',
            url: '/:id',
            permissions: 'tenant.user'
        }, {
            action: 'DELETE',
            method: 'delete',
            url: '/:id',
            permissions: 'tenant.user'
        }, {
            action: 'GET',
            method: 'search',
            permissions: 'tenant.user'
        }, {
            action: 'PUT',
            method: 'update',
            url: '/:id',
            permissions: 'tenant.user'
        }, {
            action: 'POST',
            method: 'bulk',
            url: '/bulk',
            permissions: 'tenant.user'
        }])

    api.model({
        root: 'roleTypes',
        controller: 'role-types'
    }).register('REST', { permissions: 'tenant.user' })

    api.model({
        root: 'integrations',
        controller: 'integrations'
    }).register('REST', { permissions: 'system.manage' })

    api.model('departments')
        .register([{
            action: 'POST',
            method: 'create',
            permissions: 'tenant.user'
        }, {
            action: 'GET',
            method: 'get',
            url: '/:id',
            permissions: 'tenant.user'
        }, {
            action: 'DELETE',
            method: 'delete',
            url: '/:id',
            permissions: 'tenant.user'
        }, {
            action: 'GET',
            method: 'search',
            permissions: 'tenant.user'
        }, {
            action: 'PUT',
            method: 'update',
            url: '/:id',
            permissions: 'tenant.user'
        }, {
            action: 'POST',
            method: 'bulk',
            url: '/bulk',
            permissions: 'tenant.user'
        }])

    api.model('divisions').register([{
        action: 'POST',
        method: 'create',
        permissions: 'tenant.user'
    }, {
        action: 'GET',
        method: 'get',
        url: '/:id',
        permissions: 'tenant.user'
    }, {
        action: 'DELETE',
        method: 'delete',
        url: '/:id',
        permissions: 'tenant.user'
    }, {
        action: 'GET',
        method: 'search',
        permissions: 'tenant.user'
    }, {
        action: 'PUT',
        method: 'update',
        url: '/:id',
        permissions: 'tenant.user'
    }, {
        action: 'POST',
        method: 'bulk',
        url: '/bulk',
        permissions: 'tenant.user'
    }])

    api.model('designations')
        .register([{
            action: 'POST',
            method: 'create',
            permissions: 'tenant.user'
        }, {
            action: 'GET',
            method: 'get',
            url: '/:id',
            permissions: 'tenant.user'
        }, {
            action: 'DELETE',
            method: 'delete',
            url: '/:id',
            permissions: 'tenant.user'
        }, {
            action: 'GET',
            method: 'search',
            permissions: 'tenant.user'
        }, {
            action: 'PUT',
            method: 'update',
            url: '/:id',
            permissions: 'tenant.user'
        }, {
            action: 'POST',
            method: 'bulk',
            url: '/bulk',
            permissions: 'tenant.user'
        }])

    api.model('contractors')
        .register([{
            action: 'POST',
            method: 'create',
            permissions: 'tenant.user'
        }, {
            action: 'GET',
            method: 'get',
            url: '/:id',
            permissions: 'tenant.user'
        }, {
            action: 'DELETE',
            method: 'delete',
            url: '/:id',
            permissions: 'tenant.user'
        }, {
            action: 'GET',
            method: 'search',
            permissions: 'tenant.user'
        }, {
            action: 'PUT',
            method: 'update',
            url: '/:id',
            permissions: 'tenant.user'
        }, {
            action: 'POST',
            method: 'bulk',
            url: '/bulk',
            permissions: 'tenant.user'
        }])
    api.model('sessions')
        .register([{
            action: 'POST',
            method: 'create',
            permissions: ['tenant.guest', 'tenant.user']
        }, {
            action: 'GET',
            method: 'get',
            url: '/:id',
            permissions: ['tenant.guest', 'tenant.user']
        }, {
            action: 'PUT',
            method: 'update',
            url: '/:id',
            permissions: 'tenant.user'
        }])
    api.model({
        root: 'activityLogs',
        controller: 'activity-logs'
    }).register('REST', { permissions: 'tenant.user' })
    logger.end()
}
