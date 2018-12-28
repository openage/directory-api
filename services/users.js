'use strict'

const logger = require('@open-age/logger')('services/users')
var bcrypt = require('bcrypt')
let updationScheme = require('../helpers/updateEntities')
const offline = require('@open-age/offline-processor')
const roles = require('./roles')
const db = require('../models')
// const shortid = require('shortid')



const create = async (model, context) => {
    let log = context.logger.start('services/users:create')

    let user = new db.user(model).save()
    log.end()
    return user
}

const isProfileComplete = (model) => {
    return !!(model.phone && model.profile && model.profile.firstName
        && model.profile.lastName && model.profile.dob && model.profile.gender)
}

const setPassword = async (password) => {
    const hash = await bcrypt.hashSync(password, 10)
    return hash
}

const comparePassword = async (password, hash) => { // password: new password, hash: existing password in hash
    return bcrypt.compareSync(password, hash)
}

const getOrCreate = async (model, context) => {
    let log = context.logger.start('services:users:getOrCreate')
    let user = null
    let query = {
        $or: [],
        isTemporary: {
            $ne: true
        }
    }
    if (model.email) {
        let emailObject = {}
        emailObject.email = model.email
        query.$or.push(emailObject)
    }

    if (model.phone) {
        let phoneObject = {}
        phoneObject.phone = model.phone
        query.$or.push(phoneObject)
    }

    if (model.id) {
        let idObject = {}
        idObject._id = model.id
        query.$or.push(idObject)
    }


    model.isProfileComplete = isProfileComplete(model)

    if (!model.isTemporary) {
        user = await db.user.findOne(query)
    }

    if (!user) {
        user = await create(model, context)
    }

    context.user = user
    // let roleCode = model.isTemporary ? shortid.generate() : null
    let role = await db.role.findOne({ user: context.user, tenant: context.tenant })

    if (!role) {
        role = await roles.create({ user: context.user, status: 'active' }, context)
    }

    context.role = role

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
    return context.user
}

const update = async (model, user, context) => {
    let log = context.logger.start('services/users:update')

    if (model.password) {
        model.password = await setPassword(model.password)
        log.info('password updated')
    }

    if (model.phone) {
        user.phone = model.phone
    }

    if (model.email) {
        user.email = model.email
    }

    if (model.profile) {
        user.profile = user.profile || {}

        if (model.profile.firstName) {
            user.profile.firstName = model.profile.firstName
        }

        if (model.profile.lastName) {
            user.profile.lastName = model.profile.lastName
        }

        if (model.profile.dob) {
            user.profile.dob = model.profile.dob
        }

        if (model.profile.gender) {
            user.profile.gender = model.profile.gender
        }

        if (model.profile.pic) {
            user.profile.pic = model.profile.pic
        }
    }

    if (model.identities) {
        model.user = updationScheme.update(model.identities, user.identities)
    }

    if (model.isPhoneValidate) {
        user.isPhoneValidate = model.isPhoneValidate
    }

    if (model.isEmailValidate) {
        user.isEmailValidate = model.isEmailValidate
    }

    user.isProfileComplete = isProfileComplete(user)

    await user.save()

    return getById(user.id, context)
}

const get = async (model) => {
    logger.info('get')
    let query = {}
    if (model.email) { query.email = model.email }
    if (model.phone) { query.phone = model.phone }
    try {
        let existUser = await db.user.findOne(query)
        return existUser
    } catch (error) {
        return error
    }
}

const getById = async (id, context) => {
    logger.start('getById')

    let query = {}

    if (id) {
        query._id = id
    } else {
        query._id = context.user.id
    }
    return db.user.findById(query)
}

exports.getOrCreate = getOrCreate
exports.create = create
exports.get = get
exports.update = update
exports.comparePassword = comparePassword
exports.setPassword = setPassword
exports.getById = getById
