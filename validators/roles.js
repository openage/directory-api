'use strict'

exports.canCreate = async (req) => {
    if (!req.body.organization) {
        return 'organization is required!'
    }

    // if (req.body.employee && !req.body.employee.type) {
    //     return 'employee type required'
    // }
}

exports.canCreateDependent = async (req) => {
    if (!req.body.role) {
        return 'role required'
    }

    if (!req.body.role.id && !req.body.role.user) {
        return 'either role id or user required'
    }

    if (!req.body.relation) {
        return 'relation required'
    }
}

exports.canCreateDependentsInBulk = async (req) => {
    if (!req.body) {
        return 'invalid request'
    }

    let items = req.body.items || req.body.dependents

    if (!items || !items.length) {
        return 'items required'
    }

    for (let item of items) {
        if (!item.role) {
            return 'role required'
        }

        if (!item.role.id && !item.role.user) {
            return 'either role id or user required'
        }

        if (!item.relation) {
            return 'relation required'
        }
    }
}
