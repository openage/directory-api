'use strict'
var mongoose = require('mongoose')
module.exports = {
    code: String,
    email: String,
    phone: String,
    type: { type: String, lowercase: true }, // doctor, driver, pharmacist

    designation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'designation'
    },
    supervisor: {
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
            enum: ['male', 'female', 'other']
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
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'department'
    },
    division: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'division'
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'organization'
    }
}
