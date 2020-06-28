'use strict'
var mongoose = require('mongoose')
module.exports = {
    code: { type: String, default: 'default' },
    name: { type: String, default: 'Default' },

    incharge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employee'
    },

    division: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'division'
    },
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
