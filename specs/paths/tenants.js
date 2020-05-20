module.exports = [{
    url: '/',
    post: {
        permissions: ['guest']
    }
}, {
    url: '/:id',
    put: {
        permissions: ['tenant.admin']
    },
    delete: {
        permissions: ['tenant.admin']
    },
    get: {
        permissions: ['guest', 'tenant.guest', 'organization.guest', 'tenant.user'],
        description: 'you can use application id, code, host:domain or my to get the details'
    }
}, {
    url: '/:code/exists',
    get: {
        method: 'exists',
        id: 'exists',
        summary: 'exists',
        permissions: ['guest']
    }
}]
