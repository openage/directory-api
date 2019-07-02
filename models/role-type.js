'use strict'
var mongoose = require('mongoose')

module.exports = {
    code: {
        type: String,
        required: true,
        index: true
    },
    permissions: [{ type: String }],
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tenant',
        required: true
    }
}
