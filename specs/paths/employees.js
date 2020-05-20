module.exports = [{
    url: '/',
    permissions: ['organization.user'],
    get: {},
    post: {}
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
    permissions: ['organization.user'],
    put: {},
    delete: {},
    get: {}
}]
