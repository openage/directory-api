module.exports = [{
    url: '/',
    get: {
        permissions: ['organization.user']
    },
    post: {
        permissions: ['organization.admin']
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
        permissions: ['organization.admin']
    },
    delete: {
        permissions: ['organization.admin']
    },
    get: {
        permissions: ['organization.user']
    }
}]
