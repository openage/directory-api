'use strict'
var mongoose = require('mongoose')

module.exports = {
    key: {
        type: String,
        required: [true, 'ROLE_KEY_REQUIRED'],
        index: true,
        unique: true
    },
    type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'roleType',
        required: [true, 'role-type required']
    },
    status: {
        type: String,
        default: 'new',
        enum: ['in-complete', 'new', 'active', 'inactive', 'archived', 'blocked']
    },
    permissions: [{ type: String }], // additional permissions
    dependents: [{
        role: { type: mongoose.Schema.Types.ObjectId, ref: 'role' },
        relation: String // son, brother
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'user required']
    },
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employee'
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student'
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'organization'
    },
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tenant',
        required: [true, 'tenant required']
    }
}
