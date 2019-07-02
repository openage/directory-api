'use strict'

const moment = require('moment')
const mapper = require('../mappers/activity-log')
const activityLogs = require('../services/activity-logs')

exports.create = async (req) => {
    const log = await activityLogs.create(req.body, req.context)
    return mapper.toModel(log, req.context)
}

exports.search = async (req) => {
    let query = {
        role: req.context.role
    }

    if (req.query.role) {
        query.role = req.query.role
    }

    if (req.query.action) {
        query.action = req.query.action
    }

    if (req.query.status) {
        query.status = req.query.status
    }

    if (req.query.date) {
        query.timeStamp = {
            $gte: moment(req.query.date).startOf('day').toDate(),
            $lt: moment(req.query.date).endOf('day').toDate()
        }
    }

    const logs = await activityLogs.search(query, req.context)

    return mapper.toSearchModel(logs, req.context)
}

exports.get = async (req) => {
    const log = await activityLogs.get(req.params.id, req.context)

    return mapper.toModel(log, req.context)
}
