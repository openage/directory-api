'use strict'
var mongoose = require('mongoose')

module.exports = {
    code: {type: String, default: 'default'},
    name: {type: String, default: 'Default'},
    incharge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employee'
    },
    address: {
        line1: String,
        line2: String,
        district: String,
        city: String,
        state: String,
        pinCode: String,
        country: String
    },
    timeZone: {
        name: {type: String, default: 'IST'},
        offset: {type: Number, default: 5.5}
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
