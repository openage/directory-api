'use strict'
const mapper = require('../mappers/user')
const users = require('../services/users')
const roles = require('../services/roles')
const userGetter = require('../services/user-getter')
const paging = require('../helpers/paging')

exports.create = async (req) => {
    let user = await users.create(req.body, req.context)
    return mapper.toSessionModel(user, req.context)
}

exports.signUp = async (req) => {
    let user = await users.create(req.body, req.context)
    return mapper.toSessionModel(user, req.context)
}

exports.resendOtp = async (req) => {
    let user = await users.sendOtp(req.body, req.context)
    return mapper.toSessionModel(user, req.context)
}

exports.signIn = async (req) => {
    let user = await users.verifyPassword(req.body, req.context)
    return mapper.toModel(user, req.context)
}

exports.verifyOtp = async (req) => {
    const user = await users.verifyOTP(req.body, req.context)
    return mapper.toModel(user, req.context)
}

exports.setPassword = async (req) => {
    const user = await users.verifyOTP(req.body, req.context)
    return mapper.toModel(user, req.context)
}

exports.profile = async (req) => {
    let user = await users.verifyOTP({
        profile: req.body,
        otp: req.body.otp,
        id: req.body.id || req.params.id
    }, req.context)
    return mapper.toModel(user, req.context)
}

exports.resetPassword = async (req) => {
    return exports.update(req, req.context)
}

exports.changePassword = async (req) => {
    let user = await users.updatePassword(req.body, req.context.user, req.context)

    return mapper.toModel(user, req.context)
}

exports.update = async (req) => {
    let user = await users.update('me', req.body, req.context)
    return mapper.toModel(user, req.context)
}

exports.get = async (req) => {
    let user = await userGetter.get(req.params.id, req.context)

    user.roles = await roles.search({
        user: user
    }, null, req.context)

    return mapper.toModel(user, req.context)
}

exports.exists = async (req) => {
    let user
    if (req.query.email) {
        user = await userGetter.getByEmail(req.query.email, req.context)
    } else if (req.query.mobile) {
        user = await userGetter.getByPhone(req.query.mobile, req.context)
    } else if (req.query.code) {
        user = await userGetter.getByCode(req.query.code, req.context)
    }

    return !!user
}

exports.search = async (req) => {
    return {
        items: (await userGetter.search(req.query, paging.extract(req), req.context)).items.map(i => {
            return mapper.toSearchModel(i, req.context)
        })
    }
}
