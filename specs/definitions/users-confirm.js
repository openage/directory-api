let profile = require('./profiles')
let identity = require('./identities')
module.exports = {
    id: 'string',
    phone: 'string',
    email: 'string',
    otp: 'string',
    status: 'string',
    profile: profile,
    identity: identity,
    isTemporary: 'boolean'
}
