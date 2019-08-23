'use strict'
var mongoose = require('mongoose')
module.exports = {
    code: { type: String, required: true },
    name: String,
    host: String,
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
    navs: [{
        title: String,
        icon: String,
        items: [{
            name: String,
            url: String,
            icon: String,
            title: String,
            routerLink: [String],
            permissions: [String]
        }]
    }],
    hooks: { // obsolete
        onEmployeeUpdate: String,
        onEmployeeCreate: String,
        onEmployeeDelete: String
    },
    services: [{
        logo: String,
        code: String,
        name: String,
        description: String,
        url: String, // api root url
        apps: {
            web: String,
            android: String,
            iOS: String
        },
        hooks: {
            organization: {
                config: Object,
                onCreate: String,
                onUpdate: String,
                onDelete: String
            },
            employee: {
                config: Object,
                onCreate: String,
                onUpdate: String,
                onDelete: String
            },
            student: {
                config: Object,
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
