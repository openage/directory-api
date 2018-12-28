'use strict'
// var jwt = require('jsonwebtoken')
// var db = require('../models')
// var auth = require('config').get('auth')
// var system = require('config').get('system')
const contextBuilder = require('./context-builder')

// var extractToken = (token, callback) => {
//     jwt.verify(token, auth.secret, {
//         ignoreExpiration: true
//     }, (err, claims) => {
//         if (err) {
//             return callback(err)
//         }

//         contextBuilder.create(claims).then(context => {
//             callback(null, context)
//         }).catch(err => callback(err))
//     })
// }

const fetch = (req, modelName, paramName) => {
    var value = req.query[`${modelName}-${paramName}`] || req.headers[`x-${modelName}-${paramName}`]
    if (!value && req.body[modelName]) {
        value = req.body[modelName][paramName]
    }
    if (!value) {
        return null
    }

    var model = {}
    model[paramName] = value
    return model
}

// exports.requiresOrganizationAdmin = (req, res, next) => {
//     var token = req.body.token || req.query.token || req.headers['x-access-token']

//     if (!token) {
//         return res.accessDenied('token is required.')
//     }
//     extractToken(token, (err, context) => {
//         if (err) {
//             return res.accessDenied('invalid token', 403, err)
//         }

//         if (!context.employee) {
//             return res.accessDenied('invalid employee', 403)
//         }

//         if (!context.employee.organizationAdmin) {
//             return res.accessDenied('you are not admin of the organization', 403, err)
//         }
//         context.log = res.log
//         req.context = context
//         next()
//     })
// }

// exports.requiresTenantAdmin = (req, res, next) => {
//     var token = req.body.token || req.query.token || req.headers['x-access-token']

//     if (!token) {
//         return res.accessDenied('token is required.')
//     }
//     extractToken(token, (err, context) => {
//         if (err) {
//             return res.accessDenied('invalid token', 403, err)
//         }

//         if (!context.user.tenantAdmin) {
//             return res.accessDenied('you are not admin of the tenant', 403, err)
//         }

//         context.log = res.log
//         req.context = context
//         next()
//     })
// }

exports.requireRoleKey = (req, res, next) => {
    var role = fetch(req, 'role', 'key')

    if (!role) {
        return res.accessDenied('x-role-key is required.')
    }

    contextBuilder.create({
        role: role,
        organization: fetch(req, 'org', 'code') || fetch(req, 'org', 'id'),
        tenant: fetch(req, 'tenant', 'code')
    }, res.logger).then(context => {
        if (!context.role) {
            return res.accessDenied(`invalid roleKey: '${role.key}'`)
        }
        req.context = context
        next()
    }).catch(err => res.accessDenied(err))
}

exports.requiresOrganizationCode = (req, res, next) => {
    var org = fetch(req, 'org', 'code')

    if (!org) {
        return res.accessDenied('x-org-code is required')
    }

    var tenant = fetch(req, 'tenant', 'key')
    if (!tenant) {
        return res.accessDenied('x-tenant-key is required')
    }

    contextBuilder.create({
        organization: org,
        tenant: tenant
    }, res.logger).then(context => {
        if (!context.tenant) {
            return res.accessDenied(`invalid x-tenant-key: '${tenant.key}'`)
        }

        if (context.tenant.status !== 'active') {
            return res.accessDenied(`tenant with key: '${tenant.key}' is disabled.`)
        }

        if (!context.organization) {
            return res.accessDenied(`invalid x-org-code: '${org.code}'`)
        }

        if (context.organization.status !== 'active') {
            return res.accessDenied(`organization with code: '${org.code}' is disabled.`)
        }

        req.context = context
        next()
    }).catch(err => res.accessDenied(err))
}

exports.requiresTenantKey = (req, res, next) => {
    var tenant = fetch(req, 'tenant', 'key')
    if (!tenant) {
        return res.accessDenied('x-tenant-key is required')
    }

    contextBuilder.create({
        tenant: tenant
    }, res.logger).then(context => {
        if (!context.tenant) {
            return res.accessDenied(`invalid x-tenant-key: '${tenant.key}'`)
        }
        req.context = context
        next()
    }).catch(err => res.accessDenied(err))
}

exports.requiresTenantCode = (req, res, next) => {
    var tenant = fetch(req, 'tenant', 'code')
    if (!tenant) {
        return res.accessDenied('x-tenant-code is required')
    }

    contextBuilder.create({
        tenant: tenant
    }, res.logger).then(context => {
        if (!context.tenant) {
            return res.accessDenied(`invalid x-tenant-code: '${tenant.code}'`)
        }
        req.context = context
        next()
    }).catch(err => res.accessDenied(err))
}

// exports.getToken = (context) => {
//     let serialized = contextBuilder.serialize(context)

//     return jwt.sign(serialized, auth.secret, {
//         expiresIn: auth.tokenPeriod || 1440
//     })
// }

// exports.requiresUser = (req, res, next) => {
//     var token = fetch('user', 'token')

//     if (!token) {
//         return res.accessDenied('token is required.')
//     }

//     if (token === system.token) {
//         return contextBuilder.create({
//             user: {
//                 name: 'System Admin',
//                 email: system.email,
//                 roles: [{
//                     token: system.token,
//                     level: 'system',
//                     permissions: ['owner']
//                 }]
//             }
//         }).then(context => {
//             context.log = res.log
//             req.context = context
//             next()
//         }).catch(err => res.accessDenied(err))
//     }
//     extractToken(token, (err, context) => {
//         if (err) {
//             return res.accessDenied('invalid token', 403, err)
//         }

//         if (!context.user) {
//             return res.accessDenied('invalid user', 403)
//         }
//         context.log = res.log
//         req.context = context
//         next()
//     })
// }

// exports.requiresEmployee = (req, res, next) => {
//     let roleKey = req.body.roleKey || req.query.roleKey || req.headers['x-role-key']
//     let tenantKey = req.body.tenantKey || req.query.tenantKey || req.headers['x-tenant-key']
//     let orgCode = req.body.orgCode || req.query.orgCode || req.headers['org-code']
//     let tenantCode = req.body.tenantCode || req.query.tenantCode || req.headers['tenant-code']

//     if (!roleKey && !tenantKey && !orgCode && !tenantCode) {
//         return res.accessDenied('roleKey is required.')
//     }

//     if (!roleKey && !tenantKey && orgCode && !tenantCode) {
//         return res.accessDenied('tenantKey or tenantCode is required.')
//     }

//     if (!roleKey && tenantKey && !orgCode && !tenantCode) {
//         return res.accessDenied('orgCode is required.')
//     }

//     if (!roleKey && !tenantKey && !orgCode && tenantCode) {
//         return res.accessDenied('orgCode is required.')
//     }

//     if (roleKey && !tenantKey && !orgCode && !tenantCode) {
//         db.role.findOne({ key: roleKey })
//             .populate('user organization employee tenant type')
//             .then((role) => {
//                 if (!role) {
//                     return res.accessDenied(`roleKey: '${roleKey}' does not exist.`)
//                 }
//                 return contextBuilder.create({
//                     organization: role.organization,
//                     tenant: role.tenant,
//                     employee: role.employee,
//                     user: role.user,
//                     role: role
//                 }).then(context => {
//                     context.log = res.log
//                     req.context = context
//                     next()
//                 }).catch(err => res.accessDenied(err))
//             }).catch(err => {
//                 res.log.error(err)
//                 return res.accessDenied('error occurred while getting role')
//             })
//     }

//     if ((!roleKey && tenantKey && orgCode && !tenantCode) || (!roleKey && !tenantKey && orgCode && tenantCode)) {
//         let findTenant = {}
//         if (tenantCode) {
//             findTenant.code = tenantCode
//         } else {
//             findTenant.key = tenantKey
//         }
//         db.tenant.findOne(findTenant).populate('owner').then((tenant) => {
//             if (!tenant) {
//                 return res.accessDenied(`tenant: '${tenantKey || tenantCode}' does not exist.`)
//             }

//             if (tenant.status !== 'active') {
//                 return res.accessDenied(`tenant: '${tenantKey || tenantCode}' is not active.`)
//             }

//             db.organization.findOne({
//                 code: orgCode
//             }).populate('owner').then(client => {
//                 if (!client) {
//                     return res.accessDenied(`client: '${orgCode}' does not exist.`)
//                 }

//                 if (client.status !== 'active') {
//                     return res.accessDenied(`client: '${orgCode}' is not active.`)
//                 }

//                 contextBuilder.create({
//                     organization: client,
//                     tenant: tenant

//                 }).then(context => {
//                     context.log = res.log
//                     req.context = context
//                     next()
//                 }).catch(err => res.accessDenied(err))
//             }).catch(err => {
//                 res.log.error(err)
//                 return res.accessDenied('error occurred while getting client')
//             })
//         }).catch(err => {
//             res.log.error(err)
//             return res.accessDenied('error occurred while getting tenant')
//         })
//     }
// }
