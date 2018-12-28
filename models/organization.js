'use strict'
var mongoose = require('mongoose')
module.exports = {
    code: {
        type: String,
        required: [true, 'organization code required'],
        index: true,
        unique: true
    },
    name: String,
    shortName: String,
    type: { type: String },    // hospital, clinic, pharmacy
    previousCode: String,
    isCodeUpdated: {
        type: Boolean,
        default: false
    },
    branding: {
        logo: String
    },
    location: {
        coordinates: {
            type: [Number], // [<longitude>, <latitude>]
            index: '2dsphere' // create the geospatial index
        },
        name: { type: String },
        description: { type: String }
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
    config: Object,
    services: [{
        logo: String,
        code: String,
        name: String,
        apps: {
            web: String,
            android: String,
            iOS: String
        }
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'role',
        required: [true, 'owner required']
    },

    lastEmployeeCode: { type: Number, default: 1000 },
    lastDivisionCode: { type: Number, default: 0 },
    lastDepartmentCode: { type: Number, default: 0 },
    lastDesignationCode: { type: Number, default: 0 },

    status: {
        type: String,
        default: 'active',
        enum: ['new', 'active', 'inactive']
    }
}
