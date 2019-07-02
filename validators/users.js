'use strict'

const users = require('../services/users')

exports.canCreate = async (req) => {
    // if (!req.body.phone && !req.body.email) {
    //     return 'phone or email required'
    // }
}

exports.canVerifyOtp = async (req) => {
    if (!req.body.phone && !req.body.email && !req.body.id) {
        return 'phone or email required'
    }

    if (!req.body.otp) {
        return 'otp required'
    }
}

exports.canResetPassword = async (req) => {
    if (!req.body.password) { return 'password required' }
}

exports.canResendOtp = async (req) => {
    if (!req.body.phone && !req.body.email && req.body.id) {
        return 'phone or email or id is required'
    }
    let existUser = await users.get(req.body, req.context)
    if (existUser) { req.context.user = existUser } else {
        return 'user not exist'
    }
}

exports.canSignIn = async (req) => {
    if (!req.body.phone && !req.body.email && !req.body.code) {
        return 'phone, email or code required'
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
