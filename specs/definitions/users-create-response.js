let profile = require('./profiles')
module.exports = {
    id: 'string',
    phone: 'string',
    email: 'string',
    code: 'string',
    profile: profile,
    isProfileComplete: 'boolean',
    isTemporary: 'boolean',
    roles: [{
        id: 'string'
    }]
}
