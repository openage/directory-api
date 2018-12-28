
let profile = require('./profile')
let organization = require('./organization')
let address = require('./address')
module.exports = {
    code: 'string',
    email: 'string',
    phone: 'string',
    type: 'string',
    profile: profile,
    address: address,
    employee: {
        email: 'string',
        phone: 'string',
        type: 'string',
        profile: profile
    },
    organization: organization
}