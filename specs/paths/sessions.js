module.exports = [{
    url: '/',
    permissions: ['tenant.guest', 'tenant.user'],
    post: {}
}, {
    url: '/:id',
    permissions: ['tenant.user'],
    put: {},
    delete: {},
    get: {}
}]
