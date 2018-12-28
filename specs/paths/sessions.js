module.exports = [{
    url: '/',
    post: {
        parameters: [{
            name: 'x-tenant-code',
            in: 'header',
            description: 'Tenant Code',
            required: true
        }]
    }
}, {
    url: '/{id}',
    get: {
        parameters: []
    },
    put: {
        parameters: [
            'x-role-key',
            { name: 'id', in: 'path', description: 'session-key', required: true, type: 'string' },
            { name: 'body', in: 'body', description: 'optional', required: false }
        ]
    }
}]
