'use strict'
const db = require('../models')

exports.create = async (model, context) => {
    context.logger.start('services/activityLogs:create')

    let activityLog = await new db.activityLog({
        action: model.action,
        role: context.role,
        upon: model.upon,
        timeStamp: model.timeStamp,
        changes: model.changes,
        notes: model.notes,
        status: model.status
    }).save()

    return activityLog
}

exports.search = async (query, context) => {
    context.logger.start('services/activityLogs:search')

    return db.activityLog.find(query)
}

exports.get = async (id, context) => {
    context.logger.start('services/activityLogs:get')

    return db.activityLog.findById(id)
}
