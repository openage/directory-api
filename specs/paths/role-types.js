module.exports = [{
    url: '/',
    get: {
        permissions: ['tenant.user']
    },
    post: {
        permissions: ['tenant.admin', 'organization.superadmin']
    }
}, {
    url: '/bulk',
    post: {
        id: 'create-bulk',
        summary: 'bulk create',
        permissions: ['tenant.admin', 'organization.superadmin']
    }
}, {
    url: '/:id',
    put: {
        permissions: ['tenant.admin', 'organization.superadmin']
    },
    delete: {
        permissions: ['tenant.admin', 'organization.superadmin']
    },
    get: {
        permissions: ['tenant.user']
    }
}]
