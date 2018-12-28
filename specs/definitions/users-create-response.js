let profile = require('./profiles')
module.exports = {
    id: 'string',
    phone: 'string',
    email: 'string',
    profile: profile,
    isProfileComplete: 'boolean',
    isTemporary: 'boolean',
    roles: [{
        id: 'string'
    }]
}