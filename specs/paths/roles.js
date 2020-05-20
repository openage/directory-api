module.exports = [{
    url: '/',
    permissions: ['tenant.user'],
    get: {},
    post: {}
}, {
    url: '/:id/dependent',
    post: {
        method: 'createDependent',
        id: 'dependent-create',
        summary: 'create dependent',
        permissions: ['tenant.user']
    }
}, {
    url: '/:id/dependent/bulk',
    post: {
        method: 'createDependentsInBulk',
        id: 'dependent-create-bulk',
        summary: 'create dependents',
        permissions: ['tenant.user']
    }
}, {
    url: '/isAvailable',
    post: {
        method: 'codeAvailable',
        id: 'exists',
        summary: 'exists',
        permissions: ['tenant.user']
    }
}, {
    url: '/:id',
    permissions: ['tenant.user'],
    put: {},
    delete: {},
    get: {}
}]
