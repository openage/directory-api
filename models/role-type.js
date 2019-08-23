'use strict'
var mongoose = require('mongoose')

module.exports = {
    code: {
        type: String,
        required: true,
        index: true
    },
    name: String,
    description: String,
    permissions: [{ type: String }],
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tenant',
        required: true
    }
}
