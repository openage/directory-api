'use strict'
var mongoose = require('mongoose')

module.exports = {
    purpose: String, // login
    otp: String, // login
    device: String, // machine name
    app: String, // dashboard

    status: {
        type: String,
        default: 'new',
        enum: [
            'active', 'expired', 'awaiting'
        ]
    },
    entity: {
        type: { type: String },
        id: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
}
