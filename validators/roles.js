'use strict'

exports.canCreate = async (req) => {
    if (!req.body.organization) {
        return 'organization is required!'
    }

    if (req.body.employee && !req.body.employee.type) {
        return 'employee type required'
    }
}
