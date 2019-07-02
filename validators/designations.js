'use strict'

exports.canCreate = async (req) => {
    if (!req.body.name) {
        return 'name is required'
    }
}
