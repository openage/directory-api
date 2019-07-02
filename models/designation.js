'use strict'
var mongoose = require('mongoose')

module.exports = {
    code: { type: String, default: 'default' },
    name: { type: String, default: 'Default' },
    level: { type: Number, default: 1 },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'organization'
    },
    status: {
        type: String,
        default: 'active',
        enum: ['active', 'inactive']
    }
}
