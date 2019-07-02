'use strict'

exports.canCreate = async (req) => {
    if (req.context.organization || req.context.employee) {
        return 'invalid role-key'
    }

    if (!req.body) {
        return 'invalid request'
    }

    if (!req.body.profile) {
        return 'profile required'
    }
}

exports.canBulk = async (req) => {
    if (!req.body) {
        return 'invalid request'
    }

    if (!req.body.dependents && !req.body.dependents.length) {
        return 'invalid request'
    }
}
