'use strict'

const crypto = require('../helpers/crypto')

const userGetter = require('./user-getter')
const roleGetter = require('./role-getter')
const profiles = require('./profiles')
const addresses = require('./addresses')
const locations = require('./locations')

const sessions = require('./sessions')

const roles = require('./roles')
const db = require('../models')

const activationConfig = require('config').get('activation')

const validator = require('validator')

const offline = require('@open-age/offline-processor')

const set = async (model, entity, context) => {
    if (model.password) {
        entity.password = crypto.toHash(model.password)
    }

    if (model.email && entity.email !== model.email.toLowerCase()) {
        if (!validator.isEmail(model.email)) {
            throw new Error(`${model.email} email is not valid`)
        }

        if (await userGetter.getByEmail(model.email, context)) {
            throw new Error(`${model.email} is taken`)
        }

        entity.newEmail = model.email
        if (!entity.email) {
            entity.email = model.email
        }
    }
    if (model.phone && model.phone !== entity.phone) {
        if (!validator.isMobilePhone(model.phone, 'any')) {
            throw new Error(`${model.phone} phone is not valid`)
        }

        if (await userGetter.getByPhone(model.phone, context)) {
            throw new Error(`${model.email} is taken`)
        }
        entity.newPhone = model.phone
        if (!entity.phone) {
            entity.phone = model.phone
        }
    }

    if (model.facebookId) { entity.facebookId = model.facebookId }
    if (model.code && entity.code !== model.code) {
        const existingUser = await userGetter.getByCode(model.code, context)
        if (existingUser) {
            throw new Error(`code ${model.code} is already taken`)
        }
        entity.code = model.code.toLowerCase()
    }

    entity.profile = await profiles.get(model, entity.profile, context)
    entity.address = await addresses.get(model, entity.address, context)
    entity.location = await locations.get(model, entity.location, context)

    if (model.identities) {
        entity.identities = entity.identities || {}
        if (model.identities.aadhaar) {
            entity.identities = model.identities.aadhaar
        }
        if (model.identities.pan) {
            entity.identities = model.identities.pan
        }
        if (model.identities.passport) {
            entity.identities = model.identities.passport
        }
    }

    entity.isProfileComplete = isProfileComplete(entity)

    return entity
}

/**
 * creates the user if it does not exist
 * @param {*} model
 * @param {*} context
 */
const create = async (model, context) => {
    let log = context.logger.start('services/users:create')
    let user = await userGetter.get(model, context)

    if (user) {
        throw new Error(`USER_ALREADY_EXIST`)
    }

    user = new db.user({
        tenant: context.tenant
    })
    await set(model, user, context)
    await user.save()
    await offline.queue('user', 'create', user, context)

    // if (!context.user) { // this is signup
    let session = await sessions.initiate({
        purpose: 'signup',
        device: model.device,
        app: model.app,
        user: user
    }, context)

    user.otp = session.otp // TODO: obsolete
    await user.save() // TODO: obsolete
    user.session = session
    // }

    const defaultRole = await roles.create({ user: user, status: 'active' }, context)
    user.roles = [defaultRole]

    log.end()
    return user
}

/**
 * creates a new session and sends the otp to the user
 * @param { device: String } model
 * @param {*} context
 * @returns {*} user with session
 */
exports.sendOtp = async (model, context) => {
    let entity = await userGetter.get(model, context)

    let session = await sessions.initiate({
        purpose: 'login',
        device: model.device,
        app: model.app,
        user: entity,
        templateCode: model.templateCode
    }, context)
    entity.otp = session.otp // TODO: obsolete
    await entity.save()
    entity.session = session
    return entity
}

const isProfileComplete = (model) => {
    return !!(
        model.profile &&
        model.profile.firstName &&
        model.profile.lastName &&
        model.profile.dob &&
        model.profile.gender
    )
}

const getOrCreate = async (model, context) => {
    let log = context.logger.start('services:users:getOrCreate')
    let user = await userGetter.get(model, context)

    if (!user) {
        user = await create(model, context)
    }

    // let roleCode = model.isTemporary ? shortid.generate() : null
    let role = await roleGetter.get({
        user: user
    }, context)

    if (!role) {
        role = await roles.create({ user: user, status: 'active' }, context)
    }

    // context.role = role

    // let createResult = await db.user.findOrCreate(query, model)

    // context.user = createResult.result
    // if (createResult.created) {
    //     log.info('new user created')
    //     await roles.create({ user: context.user, status: 'active' }, context)
    // } else {
    //     let userRoles = await roles.search(context)
    //     if (!userRoles.length) {
    //         await roles.create({ user: context.user, status: 'active' }, context)
    //     }
    //     log.debug('user already exist')
    // }
    // context.role = await roles.search(context)

    log.end()
    return user
}

/**
 * gets user by id (me) and updates it
 * @param {String} id
 * @param {*} model
 * @param {*} context
 * @returns {*} user
 */
exports.update = async (id, model, context) => {
    context.logger.silly('services/users:update')
    if (id === 'my' || id === 'me') {
        id = context.user.id
    }

    let entity = await userGetter.get(id, context)

    if (!entity.isEmailValidate && !entity.isPhoneValidate && entity.isTemporary) {
        return 'user is not verified or temporary'
    }
    await set(model, entity, context)
    await entity.save()

    await offline.queue('user', 'update', entity, context)

    return entity
}

const updatePassword = async (model, user, context) => {
    let log = context.logger.start('services/users:changePassword')

    if (user.password) {
        if (!crypto.compareHash(model.password, user.password)) {
            throw new Error('wrong password')
        }
    }
    user.password = await crypto.toHash(model.newPassword || model.password)

    log.end()
    return user.save()
}
/**
 * looks for user by details
 * verifies the otp
 * updates the user attributes
 *
 * @param {*} model must contain otp
 * @param {*} context
 * @returns {*} user
 */
exports.verifyOTP = async (model, context) => {
    context.logger.silly('verifyOtp')

    let entity = await userGetter.get(model, context)

    if (!entity) {
        throw new Error('USER_INVALID')
    }

    if (entity.status !== 'active') {
        throw new Error('USER_BLOCKED')
    }

    if (!model.otp && !entity.otp && entity.otp !== Number(model.otp) && model.otp !== activationConfig.otp) {
        throw new Error('OTP_INVALID')
    }

    let session
    if (model.session && model.session.id) {
        session = await sessions.activate(model.session.id, model.otp, context)
    }

    context.logger.silly('otp verified')

    entity.otp = null
    entity.isTemporary = false

    if (entity.phone) {
        entity.newPhone = null
        model.isPhoneValidate = true
    }

    if (entity.email) {
        entity.newEmail = null
        model.isEmailValidate = true
    }

    entity = await set(model, entity, context)

    await entity.save()

    entity.roles = await roles.search({
        user: entity
    }, null, context)

    entity.session = session

    return entity
}

exports.verifyPassword = async (model, context) => {
    context.logger.silly('verifyPassword')

    let entity = await userGetter.get(model, context)

    if (!entity) {
        throw new Error('USER_INVALID')
    }

    if (entity.status !== 'active') {
        throw new Error('USER_BLOCKED')
    }

    if (!entity.password) {
        throw new Error('PASSWORD_NOT_SET')
    }

    if (!crypto.compareHash(model.password, entity.password)) {
        throw new Error('PASSWORD_INVALID')
    }

    entity = await set(model, entity, context)

    await entity.save()

    entity.roles = await roles.search({
        user: entity
    }, null, context)

    context.setUser(entity)

    entity.session = await sessions.create({
        purpose: 'login',
        device: model.device,
        app: model.app,
        user: entity
    }, context)

    return entity
}

exports.getOrCreate = getOrCreate
exports.create = create

exports.updatePassword = updatePassword

exports.get = userGetter.get
exports.getById = userGetter.getById
exports.getByCode = userGetter.getByCode
exports.getByPhone = userGetter.getByPhone
exports.getByEmail = userGetter.getByEmail
