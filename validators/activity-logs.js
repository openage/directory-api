'use strict'

exports.canCreate = async (req) => {
    if (!req.body) {
        return 'activityLog model is required'
    }

    if (req.body.status && req.body.status !== 'active' && req.body.status !== 'inactive') {
        return 'invalid status'
    }

    if (req.body.action && req.body.action !== 'created' && req.body.action !== 'updated' && req.body.action !== 'deleted') {
        return 'invalid action'
    }
}

exports.canSearch = async (req) => {
    if (!req.query) {
        return 'activityLog query is required'
    }

    if (req.query.status && req.query.status !== 'active' && req.query.status !== 'inactive') {
        return 'invalid status'
    }

    if (req.query.action && req.query.action !== 'created' && req.query.action !== 'updated' && req.query.action !== 'deleted') {
        return 'invalid action'
    }
}

exports.canGet = async (req) => {
    if (!req.params && !req.params.id) {
        return 'id is required'
    }
}
