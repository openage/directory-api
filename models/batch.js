'use strict'
var mongoose = require('mongoose')

module.exports = {
    code: { type: String, default: 'default' },
    name: { type: String, default: 'Default' },

    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'organization'
    },
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tenant'
    },
    status: {
        type: String,
        default: 'active',
        enum: ['active', 'inactive']
    }
}
