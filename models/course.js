'use strict'
var mongoose = require('mongoose')
module.exports = {
    code: { type: String, default: 'default' },
    name: { type: String, default: 'Default' },

    level: { type: Number, default: 1 },

    batches: [{
        batch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'batch'
        },
        lastRollNo: { type: Number, default: 0 },
        status: {
            type: String,
            default: 'started',
            enum: ['open', 'started', 'passed']
        }
    }],

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
