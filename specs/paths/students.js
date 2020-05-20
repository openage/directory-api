module.exports = [{
    url: '/',
    get: {
        permissions: ['organization.user']
    },
    post: {
        permissions: ['organization.user']
    }
}, {
    url: '/exists',
    get: {
        method: 'exists',
        id: 'check-exists',
        summary: 'exists',
        permissions: ['organization.guest', 'organization.user']
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
        permissions: ['organization.user']
    },
    delete: {
        permissions: ['organization.admin']
    },
    get: {
        permissions: ['organization.user']
    }
}]
