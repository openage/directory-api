module.exports = [{
    url: '/',
    get: {
        permissions: ['organization.user', 'organization.admin', 'tenant.admin']
    },
    post: {
        permissions: ['organization.admin', 'tenant.admin']
    }
}, {
    url: '/bulk',
    post: {
        id: 'create-bulk',
        summary: 'bulk create',
        permissions: ['organization.admin']
    }
}, {
    url: '/:id',
    put: {
        permissions: ['organization.admin', 'tenant.admin']
    },
    delete: {
        permissions: ['organization.admin', 'tenant.admin']
    },
    get: {
        permissions: ['organization.user', 'organization.admin', 'tenant.admin']
    }
}]
