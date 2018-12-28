'use strict'

exports.canCreate = async (req, callback) => {
    if (!req.body.code || !req.body.permissions) {
        return 'roleType code and permissions are required.'
    }
}
