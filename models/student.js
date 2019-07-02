'use strict'
var mongoose = require('mongoose')
module.exports = {
    code: String,
    email: {
        type: String,
        lowercase: true
    },
    phone: String,

    doj: Date,
    dol: Date,
    reason: String,
    batch: {
        id: String,
        code: String,
        name: String
    },
    course: {
        id: String,
        code: String,
        name: String
    },
    college: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'division'
    },
    mentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employee'
    },
    status: {
        type: String,
        default: 'new',
        enum: ['in-complete', 'new', 'active', 'inactive', 'archived']
    },
    profile: {
        firstName: String,
        lastName: String,
        pic: {
            url: String,
            thumbnail: String
        },
        dob: {
            type: Date,
            default: null
        },
        fatherName: String,
        bloodGroup: String,
        gender: {
            type: String,
            enum: ['male', 'female', 'other', 'none', 'unknown'],
            default: 'none'
        }
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
    meta: Object,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'user required']
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'organization',
        required: [true, 'organization required!']
    }
}
