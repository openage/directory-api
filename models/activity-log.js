'use strict'
var mongoose = require('mongoose')

// switched off wifi - 10:00 am
// {{changes.newValue}} {{changes.key}} - {{timeStamp}}

// logged in  - 9:15 am
module.exports = {
    action: { // updated
        type: String,
        default: 'created',
        enum: ['created', 'updated', 'deleted']
    },
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'role' }, // sunny
    upon: {
        id: String, // imie no
        name: String, // one plus 5T
        type: {
            type: String // phone
        }
    },
    timeStamp: { type: Date, default: Date.now }, // 10:00 am
    changes: [{
        key: String, // wifi , ‘’
        oldValue: String,
        newValue: String // switched off, logged in
    }],
    notes: String,
    status: {
        type: String,
        default: 'active',
        enum: ['active', 'inactive']
    }
}
