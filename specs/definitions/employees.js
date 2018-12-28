let address = require('./address')
let profile = require('./profile')
let role = require('./role')
let location = require('./locations')

module.exports = {
    id: 'string',
    email: 'string',
    code: 'string',
    location: location,
    address: address,
    profile: profile,
    role: role
}
