module.exports = [{
    url: '/',
    get: {
        permissions: ['tenant.user']
    },
    post: {
        permissions: ['tenant.admin']
    }
}, {
    url: '/bulk',
    post: {
        id: 'create-bulk',
        summary: 'bulk create',
        permissions: ['tenant.admin']
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
        permissions: ['tenant.user']
    }
}]
