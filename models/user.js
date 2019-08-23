'use strict'

const mongoose = require('mongoose')

module.exports = {
    phone: String,
    newPhone: String,
    isPhoneValidate: {
        type: Boolean,
        default: false
    },
    email: {
        type: String,
        lowercase: true
    },
    newEmail: String,
    isEmailValidate: {
        type: Boolean,
        default: false
    },
    facebookId: String,

    lastSeen: Date,

    code: String, // userName
    previousCode: String,
    isCodeUpdated: {
        type: Boolean,
        default: false
    },

    otp: Number,
    password: String,
    profile: {
        firstName: {
            type: String,
            lowercase: true
        },
        lastName: {
            type: String,
            lowercase: true
        },
        dob: {
            type: Date,
            default: null
        },
        bloodGroup: String,
        pic: {
            url: String,
            thumbnail: String
        },
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
    identities: { // hash these fields
        aadhaar: {
            type: String
        },
        pan: {
            type: String
        },
        passport: {
            type: String
        }
    },
    status: {
        type: String,
        default: 'active',
        enum: ['active', 'inactive', 'blocked']
    },
    isProfileComplete: {
        type: Boolean,
        default: false
    },
    isTemporary: {
        type: Boolean,
        default: false
    },

    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tenant',
        required: true
    }
}
