
let profile = require('./profiles')
let identity = require('./identities')
module.exports = {
    id: 'string',
    phone: 'string',
    email: 'string',
    otp: 'string',
    profile: profile,
    identity: identity,
    isProfileComplete: 'boolean',
    roles: [{
        id: 'string'
    }]
}
