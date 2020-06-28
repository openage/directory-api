'use strict'
const mapper = require('../mappers/user')
const users = require('../services/users')
const roles = require('../services/roles')
const userGetter = require('../services/user-getter')
const paging = require('../helpers/paging')

const inflate = (flattened) => {
    let model = {}

    Object.getOwnPropertyNames(flattened).forEach(key => {
        const value = flattened[key]

        if (!value) {
            return
        }

        let parts = key.split('-')
        let index = 0
        let obj = model

        for (const part of parts) {
            if (index === parts.length - 1) {
                obj[part] = value
            } else {
                obj[part] = obj[part] || {}
            }

            obj = obj[part]
            index++
        }
    })

    return model
}

exports.create = async (req) => {
    let user = await users.create(req.body, req.context)
    return mapper.toSessionModel(user, req.context)
}

exports.register = async (req) => { // user register by other services
    let user = await users.create(req.body, req.context)
    return mapper.toModel(user, req.context)
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
    let user = await users.update(req.params.id, req.body, req.context)
    return mapper.toModel(user, req.context)
}

exports.signOut = async (req) => {
    let user = await users.signOut(req.params.id, req.context)
    return 'Signed Out Successfully'
}

exports.get = async (req) => {
    let user = await userGetter.get(req.params.id, req.context)

    user.roles = (await roles.search({
        user: user
    }, null, req.context)).items

    return mapper.toModel(user, req.context)
}

exports.exists = async (req) => {
    let query = inflate(req.query)
    let user
    if (query.email) {
        user = await userGetter.getByEmail(query.email, req.context)
    } else if (query.mobile) {
        user = await userGetter.getByPhone(query.mobile, req.context)
    } else if (query.code) {
        user = await userGetter.getByCode(query.code, req.context)
    } else if (query.employee && query.employee.code) {
        user = await userGetter.getByEmployeeCode(query.employee.code, req.context)
    } else if (query.student && query.student.code) {
        user = await userGetter.getByStudentCode(query.student.code, req.context)
    }

    if (!user) {
        return {
            exists: false,
            logins: {}
        }
    }
    return {
        exists: true,
        logins: {
            otp: true,
            password: !!user.password,
            email: !!user.isEmailValidate,
            phone: !!user.isPhoneValidate,
            facebook: !!user.facebookId,
            google: !!user.google,
            linkedIn: !!user.linkedIn
        }
    }
}

exports.search = async (req) => {
    return {
        items: (await userGetter.search(req.query, paging.extract(req), req.context)).items.map(i => {
            return mapper.toModel(i, req.context)
        })
    }
}

exports.authRedirect = async (req) => {
    const provider = require(`../providers/${req.params.provider}/auth`)

    if (!provider) {
        throw new Error('provider not found')
    }
    req.context.logger.info('sending redirect url')
    return { url: provider.getRedirectUrl(req.context) }
}
exports.authSuccess = async (req) => {
    const provider = require(`../providers/${req.params.provider}/auth`)

    if (!provider) {
        throw new Error('provider not found')
    }
    let authCode = req.query.code || req.body.code
    let user = await provider.success(authCode, req.context)

    return mapper.toModel(user, req.context)
}
exports.authLogout = (req) => {
    const provider = require(`../providers/${req.params.provider}/auth`)

    if (!provider) {
        throw new Error('provider not found')
    }

    return provider.logout(req.context)
}
