'use strict'
var jwt = require('jsonwebtoken')
var db = global.db
var authConfig = require('config').get('auth')
var dbQuery = require('../helpers/querify')
var bluebird = require('bluebird')
var _ = require('underscore')

var extractToken = (token, req, res, next) => {
    jwt.verify(token, authConfig.secret, {
        ignoreExpiration: true
    }, function (err, claims) {
        if (err) {
            return res.failure('invalid token.')
        }

        db.user.findOne({
            where: { id: claims.user }

        })
            .then(user => {
                if (!user) {
                    throw new Error('no user found')
                }
                req.user = user
                next()
            })
            .catch(err => {
                res.failure(err)
            })
    })
}

exports.requiresToken = (req, res, next) => {
    var token = req.body.token || req.query.token || req.headers['x-access-token']
    if (!token) {
        return res.status(403).send({
            success: false,
            message: 'token is required.'
        })
    }

    extractToken(token, req, res, next)
}

exports.requiresSupervisor = (req, res, next) => { // todo
    bluebird.all([
        db.teamMember.findOne({
            where: {
                RegularEmployeeId: req.employee.id
            },
            include: [{
                model: db.employee,
                as: 'Supervisor',
                include: [db.designation]
            }],
            attributes: ['id']
        }),
        db.teamMember.findAll({
            where: {
                supervisorId: req.employee.id
            },
            include: [{
                model: db.employee,
                as: 'RegularEmployee',
                include: [db.designation]
            }],
            attributes: ['id']
        })
    ])
        .spread((supervisor, reporties) => {
            if (supervisor) {
                req.supervisor = supervisor.Supervisor
            }
            req.reporties = []
            if (!_.isEmpty(reporties)) {
                reporties.forEach(reportie => req.reporties.push(reportie.RegularEmployee))
            }
            next()
        })

    // db.teamMember.findOne({
    //         where: { RegularEmployeeId: req.employee.id },
    //         include: [{
    //             model: db.employee,
    //             as: 'Supervisor',
    //             include: [db.designation]
    //         }],
    //         attributes: ['id']
    //     })
    // .then(teamMember => {
    //         if (teamMember) {
    //             req.supervisor = teamMember.Supervisor;
    //         }
    // next();
    // dbQuery.findEmployee({ id: teamMember.supervisorId })
    //     .then(supervisor => {
    //         req.supervisor = supervisor;
    //         next();
    //     });
    // })
        .catch(err => {
            res.failure(err)
        })
}

exports.requiresOrg = (req, res, next) => {
    var orgCode = req.body.orgCode || req.query.orgCode || req.headers['org-code']

    if (!orgCode) {
        return res.failure('org-code is required.')
    }
    dbQuery.findOrg({
        code: orgCode
    })
        .then(org => {
            if (!org) {
                return res.failure('organization does not exist')
            }
            req.org = org
            next()
        })
}

exports.requiresApp = (req, res, next) => {
    let appCode = req.body.appCode || req.query.appCode || req.headers['x-app-code']

    if (!appCode) { return res.failure('x-app-code is required.') }

    db.app.findOne({
        where: { code: appCode }
    }).then((app) => {
        if (!app) { return res.failure('app does not exist') }
        req.app = app
        next()
    })
}

exports.requiresApiKey = (req, res, next) => {
    let appApiKey = req.body.appApiKey || req.query.appApiKey || req.headers['x-app-api-key']
    if (!appApiKey) { return res.failure('x-app-api-key is required.') }

    db.app.findOne({
        where: { key: appApiKey }
    }).then((app) => {
        if (!app) { return res.failure('app does not exist') }
        req.app = app
        next()
    })
}

exports.getToken = employee => { // todo
    var claims = {
        employee: employee.id,
        code: employee.code
    }

    return jwt.sign(claims, authConfig.secret, {
        expiresIn: authConfig.tokenPeriod || 1440
    })
}

exports.getUserToken = (user) => {
    var claims = {
        user: user.id
    }

    return jwt.sign(claims, authConfig.secret, {
        expiresIn: authConfig.tokenPeriod || 1440
    })
}
