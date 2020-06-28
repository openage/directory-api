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
    meta: Object,
    navs: [{ type: Object }],
    hooks: [{
        trigger: {
            entity: String,
            action: String,
            when: String
        },
        actions: [{
            code: String,
            name: String,
            handler: String,
            type: { type: String },
            config: Object
        }]
    }],
    services: [{
        logo: String,
        code: String,
        name: String,
        url: String // api root url
    }],
    status: {
        type: String,
        default: 'active',
        enum: ['active', 'inactive']
    },
    rebranding: Boolean,
    styles: String,
    social: [{
        model: {
            code: String
        },
        config: Object
    }]
}
