'use strict'
var mongoose = require('mongoose')
module.exports = {
    code: {
        type: String,
        required: [true, 'organization code required'],
        index: true,
        unique: true
    },
    logo: {
        url: String,
        thumbnail: String
    },
    name: String,
    shortName: String,
    type: { type: String }, // hospital, clinic, pharmacy
    previousCode: String,
    isCodeUpdated: {
        type: Boolean,
        default: false
    },

    email: String, // primary contact
    phone: String,

    about: String,

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
        country: String,
        location: String
    },
    config: Object,
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
        url: String
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'role'
    },
    meta: Object,

    isProfileCompleted: {
        type: Boolean,
        default: false
    },

    lastEmployeeCode: { type: Number, default: 1000 },
    lastDivisionCode: { type: Number, default: 0 },
    lastDepartmentCode: { type: Number, default: 0 },
    lastDesignationCode: { type: Number, default: 0 },
    lastContractorCode: { type: Number, default: 0 },
    lastCourseCode: { type: Number, default: 0 },
    lastBatchCode: { type: Number, default: 0 },
    lastStudentCode: { type: Number, default: 0 },

    status: {
        type: String,
        default: 'active',
        enum: ['new', 'active', 'inactive', 'trash']
    },
    styles: String,
    social: [{
        model: {
            code: String
        },
        config: Object
    }],

    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tenant'
        //    required: true TODO: add tenant to prod
    }
}
