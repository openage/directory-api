'use strict'
var mongoose = require('mongoose')
module.exports = {
    code: { type: String, required: true },
    name: String,
    logo: {
        url: String,
        thumbnail: String
    },
    key: String,
    config: Object,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'role'
    },
    hooks: { // obsolete
        onEmployeeUpdate: String,
        onEmployeeCreate: String,
        onEmployeeDelete: String
    },
    services: [{
        logo: String,
        code: String,
        name: String,
        url: String, // api root url
        apps: {
            web: String,
            android: String,
            iOS: String
        },
        hooks: {
            organization: {
                onCreate: String,
                onUpdate: String,
                onDelete: String
            },
            employee: {
                onCreate: String,
                onUpdate: String,
                onDelete: String
            },
            student: {
                onCreate: String,
                onUpdate: String,
                onDelete: String
            }
        }
    }],
    status: {
        type: String,
        default: 'active',
        enum: ['active', 'inactive']
    }
}
