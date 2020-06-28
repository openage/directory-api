'use strict'

const users = require('../services/users')

exports.canCreate = async (req) => {
    // if (!req.body.phone && !req.body.email) {
    //     return 'phone or email required'
    // }
}

exports.canVerifyOtp = async (req) => {
    if (!(
        req.body.phone ||
        req.body.email ||
        req.body.id ||
        req.body.code ||
        (req.body.student && req.body.student.code) ||
        (req.body.employee && req.body.employee.code)
    )) {
        return 'one of following are required phone, email, code or id'
    }

    if (!req.body.otp) {
        return 'otp required'
    }
}

exports.canResetPassword = async (req) => {
    if (!req.body.password) { return 'password required' }
}

exports.canUpdate = async (req) => {
    if (!(req.params.id === 'my' || req.params.id === req.context.user.email || req.params.id === req.context.user.code || req.params.id === req.context.user.phone || req.context.hasPermission('system.manage'))) { return 'password required' }
}

exports.canSignOut = async (req) => {
    if (!(req.params.id === 'my' || req.params.id === req.context.user.email || req.params.id === req.context.user.code || req.params.id === req.context.user.phone || req.context.hasPermission('system.manage'))) { return 'permission required' }
}

exports.canResendOtp = async (req) => {
    if (!req.body.phone && !req.body.email && !req.body.id && !req.body.code) {
        return 'phone or email or id or code is required'
    }
    let existUser = await users.get(req.body, req.context)
    if (existUser) { req.context.user = existUser } else {
        return 'user not exist'
    }
}

exports.canSignIn = async (req) => {
    if (!(
        req.body.phone ||
        req.body.email ||
        req.body.id ||
        req.body.code ||
        (req.body.student && req.body.student.code) ||
        (req.body.employee && req.body.employee.code)
    )) {
        return 'one of following are required phone, email, code or id'
    }

    if (!req.body.password) {
        return 'password required'
    }
}

exports.canSignUp = async (req) => {
    if (!req.body.phone && !req.body.email && !req.body.facebookId) {
        return 'phone, email required'
    }
}

exports.canProfile = async (req) => {
    if (!req.body.otp) {
        return 'otp required to update profile'
    }
}
