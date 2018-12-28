'use strict'
var mongoose = require('mongoose')

module.exports = {
    type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'roleType'
    },
    status: {
        type: String,
        default: 'active',
        enum: ['active', 'inactive']
    },
    code: String,
    key: String, // this key is unique
    permissions: [{ type: String }], // additional permissions
    previousCode: String,
    isCodeUpdated: {
        type: Boolean,
        default: false
    },
    dependents: [{
        role: { type: mongoose.Schema.Types.ObjectId, ref: 'role' },
        relation: String          //son, brother
    }],
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employee'
    },
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tenant'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'organization'
    }

}
