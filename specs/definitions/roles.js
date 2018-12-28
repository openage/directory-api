
let profile = require('./profile')
let organization = require('./organization')
let address = require('./address')
module.exports = {
    id: 'string',
    code: 'string',
    key: 'string',
    email: 'string',
    phone: 'string',
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
