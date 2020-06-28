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
    permissions: [{
        code: { type: String },
        name: String,
        description: String
    }],
    status: String,
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tenant',
        required: true
    }
}
