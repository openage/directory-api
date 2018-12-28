let profile = require('./profiles')
let identity = require('./identities')
let role = require('./roles')
module.exports = {
    id: 'string',
    phone: 'string',
    email: 'string',
    otp: 'string',
    profile: profile,
    identity: identity,
    isProfileComplete: 'boolean',
    isTemporary: 'boolean',
    roles: [role]
}