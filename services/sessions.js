'use strict'

// const firebase = require('../providers/firebase')
const logger = require('@open-age/logger')('service/sessions')
const db = require('../models')
const roleService = require('./roles')

const create = async (model, context) => {
    let log = context.logger.start('services/sessions:create')
    let session = await new db.session({
        tenant: context.tenant,
        device: model.device,
        app: model.app,
        user: model.user,
        status: 'awaiting'
    }).save()
    log.end()
    return session
}

const update = async (model, sessionId, context) => {
    let log = context.logger.start('services:sessions:update')

    let session = await db.session.findById(sessionId)

    session.user = context.user
    session.status = model.status || 'active'

    session.save()

    // await firebase.update({ // update on firebase
    //     status: session.status,
    //     user: session.user
    // }, `sessions/${session.id}`)

    log.end()

    return session
}

exports.get = async (id, context) => {
    const log = logger.start('services/session:get')
    const session = await db.session.findById(id).populate('user')
    if (session.user) {
        context.user = session.user
        session.user.roles = await roleService.search(context)
    }
    log.end()
    return session
}
exports.create = create
exports.update = update
