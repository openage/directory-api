module.exports = [{
    url: '/',
    // get: {
    //     permissions: ['tenant.user']
    // },
    post: {
        permissions: ['tenant.user']
    }
}, {
    url: '/bulk',
    post: {
        id: 'create-bulk',
        summary: 'bulk create',
        permissions: ['tenant.user']
    }
}]
