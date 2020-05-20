'use strict'

// const firebase = require('../providers/firebase')
const db = require('../models')
const roleService = require('./roles')
const userGetter = require('./user-getter')
const crypto = require('../helpers/crypto')

const activationConfig = require('config').get('activation')
const offline = require('@open-age/offline-processor')

exports.get = async (query, context) => {
    let entity
    if (typeof query === 'string' && query.isObjectId()) {
        entity = await db.session.findById(query).populate('user')
    }
    if (query.id) {
        entity = await db.session.findById(query.id).populate('user')
    }

    if (entity && entity.user) {
        entity.user.roles = await roleService.search({ user: entity.user }, null, context)
    }
    return entity
}

exports.searchByUser = async (user, context) => {

    let query = {
        user: user,
        status: 'active'
    }

    let items = await db.session.find(query).populate('user')

    return items
}
/** */
exports.initiate = async (model, context) => {
    let log = context.logger.start('services/sessions:create')
    let session = await new db.session({
        purpose: model.purpose,
        device: model.device,
        app: model.app,
        otp: crypto.newOTP(),
        user: await userGetter.get(model.user, context),
        status: 'awaiting',
        tenant: context.tenant
    }).save()

    session.templateCode = model.templateCode || 'session-initiated'

    session.user.roles = await roleService.search({
        user: session.user
    }, null, context)

    await offline.queue('session', 'initiate', session, context)
    log.end()
    return session
}

exports.update = async (id, model, context) => {
    let session = await db.session.findById(id)
    session.user = context.user
    session.status = model.status || 'active'
    session.otp = null
    if (model.entity) {
        session.entity = {
            type: model.entity.type,
            id: model.entity.id
        }
    }

    await session.save()

    if (session.status != 'expired') {
        await offline.queue('session', 'start', session, context)
    }

    return session
}

exports.create = async (model, context) => {
    let entity = await new db.session({
        purpose: model.purpose,
        device: model.device,
        app: model.app,
        user: await userGetter.get(model.user, context),
        status: 'active',
        tenant: context.tenant
    }).save()
    await entity.save()

    entity.user.roles = await roleService.search({
        user: entity.user
    }, null, context)

    await offline.queue('session', 'start', entity, context)
    return entity
}

exports.activate = async (id, otp, context) => {
    context.logger.silly('session:start')

    let entity = await db.session.findById(id)

    if (entity.otp !== Number(otp) && otp !== activationConfig.otp) {
        throw new Error('invalid otp')
    }
    context.logger.silly('otp verified')

    entity.otp = null
    entity.status = 'active'
    entity.user = context.user

    await entity.save()

    entity.user.roles = await roleService.search({
        user: entity.user
    }, null, context)

    await offline.queue('session', 'start', entity, context)
    return entity
}
