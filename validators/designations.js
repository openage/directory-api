'use strict'

exports.canCreate = async (req) => {
    if (!req.body.name || !req.body.code) {
        return 'name and code is required'
    }
}
