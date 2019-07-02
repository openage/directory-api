const profile = require('./profile')

module.exports = {
    role: {
        id: 'string',
        user: {
            phone: 'string',
            email: 'string',
            profile: profile
        }
    },
    relation: 'string'
}
