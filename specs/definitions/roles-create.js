
let profile = require('./profile')
let organization = require('./organization')
let address = require('./address')
module.exports = {
    employee: {
        email: 'string',
        phone: 'string',
        type: 'string',
        profile: profile,
        address: address
    },
    organization: organization
}
