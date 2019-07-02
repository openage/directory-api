'use strict'
var mongoose = require('mongoose')
module.exports = {
    code: String,
    name: String,
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
