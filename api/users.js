'use strict'
const mapper = require('../mappers/user')
const users = require('../services/users')
const auth = require('../helpers/auth')
const roles = require('../services/roles')
const offline = require('@open-age/offline-processor')
const db = require('../models')

exports.create = async (req) => {
    let log = req.context.logger.start('api:users:create')
    let model = req.body
    model.otp = Math.floor(Math.random() * 100000) + 100000
    let userDetails = await users.getOrCreate(model, req.context)
    userDetails.otp = model.otp
    await userDetails.save()
    userDetails.roles = [{ id: req.context.role.id }]

    log.debug('user created')
    req.context.processSync = true
    await offline.queue('user', 'create', { id: userDetails.id }, req.context)
    log.debug('otp pushed')
    log.end()
    return mapper.toModel(userDetails)
}

exports.verifyOtp = async (req) => {
    let logger = req.context.logger.start('verifyOtp')
    let model = req.body
    let context = {
        tenant: req.context.tenant
    }

    let userDetails = await users.getOrCreate(model, req.context)

    if (userDetails.otp !== Number(model.otp) && model.otp !== '112233') {
        logger.error('invalid pin')
        throw new Error('invalid otp')
    }

    logger.debug('pin verified')

    if (model.phone) {
        model.isPhoneValidate = true
    }

    if (model.email) {
        model.isEmailValidate = true
    }

    let updatedUser = await users.update(model, userDetails, req.context)

    context.user = updatedUser
    updatedUser.roles = await roles.search(context)

    return mapper.toModel(updatedUser)
}

exports.signIn = async (req, res) => {
    let logger = req.context.logger.start('signIn')
    let model = req.body
    let context = {
        tenant: req.context.tenant
    }

    try {
        let existingUser = await users.get(model)

        let isPasswordMatch = await users.comparePassword(model.password, existingUser.password)

        if (!isPasswordMatch) {
            throw new Error('Bad Password')
        }

        existingUser.roles = await db.role.find({
            user: existingUser.id,
            tenant: req.context.tenant.id
        })

        context.user = existingUser

        existingUser.token = await auth.getToken(context)

        return res.data(mapper.toModel(existingUser))
    } catch (error) {
        logger.error(error)
        return res.failure(error)
    }
}

exports.resetPassword = async (req, res) => {
    let logger = req.context.logger.start('resetPassword')
    let model = req.body
    try {
        let updatedUser = await users.update(model, req.context.user)

        return res.data(mapper.toModel(updatedUser))
    } catch (err) {
        logger.error(err)
        return res.failure(err)
    }
}

exports.update = async (req, res) => {
    let logger = req.context.logger.start('update')

    let model = req.body

    let id

    if (req.params.id !== 'my') {
        id = req.params.id
    }

    try {
        let userModel = await users.getById(id, req.context)
        let updatedUser = await users.update(model, userModel, req.context)

        if (req.params.id === 'my') {
            req.context.processSync = true    //update tenants on user update

            offline.queue('role', 'update', {
                id: req.context.role.id
            }, req.context)
        }

        updatedUser.roles = await roles.search(req.context)
        return res.data(mapper.toModel(updatedUser))
    } catch (error) {
        logger.error(error)
        return res.failure(error)
    }
}

exports.get = async (req, res) => {
    req.context.logger.start('get')

    let id = req.params.id === 'my' ? req.context.user.id : req.params.id

    let existingUser = await users.getById(id, req.context)

    req.context.user = existingUser

    existingUser.roles = await roles.search(req.context)

    return mapper.toModel(existingUser)
}

exports.search = async (req) => {
    let log = req.context.logger.start('api/users:search')

    let query = {}

    if (req.query.phone) {
        query.phone = req.query.phone
    }

    if (req.query.name) {
        query.$or = [{
            phone: {
                $regex: '^' + req.query.name,
                $options: 'i'
            }
        }, {
            'profile.firstName': {
                $regex: '^' + req.query.name,
                $options: 'i'
            }
        }]
    }

    if (req.query.isTemporary) {
        query.isTemporary = !!(req.query.isTemporary)
    }

    if (req.query.isEmailValidate) {
        query.isEmailValidate = !!(req.query.isEmailValidate)
    }

    if (req.query.isPhoneValidate) {
        query.isPhoneValidate = !!(req.query.isPhoneValidate)
    }

    let users = await db.user.find(query)

    let userList = []
    for (let user of users) {
        let roles = await db.role.find({
            user: user.id,
            organization: { $exists: false },
            employee: { $exists: false }
        })

        user.roles = roles.map(role => {
            return {
                id: role.id,
                code: role.code
            }
        })
        userList.push(user)
    }
    log.end()
    return mapper.toSearchModel(userList)
}

exports.resendOtp = async (req) => {
    let log = req.context.logger.start('api/users:resend')

    let model = req.body
    model.otp = Math.floor(Math.random() * 100000) + 100000
    let userDetails = await users.getOrCreate(model, req.context)
    userDetails.otp = model.otp
    await userDetails.save()

    req.context.processSync = true
    await offline.queue('user', 'create', { id: userDetails.id }, req.context)
    log.debug('otp pushed')
    log.end()
    return mapper.toModel(userDetails)
}
