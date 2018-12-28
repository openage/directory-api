'use strict'
module.exports = {
    phone: String,
    email: String,
    otp: Number,
    password: String,
    picUrl: { type: String }, // TODO: obsolete
    profile: {
        firstName: { type: String, lowercase: true },
        lastName: { type: String, lowercase: true },
        dob: Date,
        gender: {
            type: String,
            enum: ['male', 'female', 'other']
        },
        pic: {
            url: String,
            thumbnail: String
        }
    },
    identities: { // hash these fields
        aadhaar: { type: String },
        pan: { type: String },
        passport: { type: String }
    },
    isProfileComplete: { type: Boolean, default: false },
    isPhoneValidate: { type: Boolean, default: false },
    isEmailValidate: { type: Boolean, default: false },
    isTemporary: { type: Boolean, default: false }
}
