module.exports = [{
    url: '/',
    get: {
        permissions: ['tenant.user']
    },
    post: {
        permissions: ['tenant.guest', 'tenant.user']
    }
}, {
    url: '/:code/summary',
    get: {
        method: 'get',
        id: 'get-by-code',
        summary: 'summary by code',
        permissions: ['tenant.guest', 'organization.admin', 'tenant.user']
    }
}, {
    url: '/isAvailable',
    post: {
        method: 'codeAvailable',
        id: 'exists',
        summary: 'exists',
        permissions: ['tenant.user', 'organization.admin', 'tenant.guest']
    }
}, {
    url: '/:id',
    put: {
        permissions: ['organization.admin', 'organization.admin', 'tenant.admin']
    },
    delete: {
        permissions: ['organization.admin', 'organization.admin', 'tenant.admin']
    },
    get: {
        permissions: ['organization.user', 'organization.admin', 'tenant.admin']
    }
}]
