module.exports = [{
    url: '/',
    post: {
        'parameters': [{
            'name': 'body',
            'in': 'body',
            'description': 'Role type details',
            'required': true
        }, {
            'name': 'x-role-key',
            'in': 'header',
            'description': 'User should be owner of the tenant',
            'required': true,
            'type': 'string'
        }],
        'responses': {
            'default': {
                'description': 'Unexpected error',
                'schema': {
                    '$ref': '#/definitions/Error'
                }
            }
        }
    },
    get: { parameters: ['x-role-key'] }
}, {
    url: '/{id}',
    put: { parameters: ['x-role-key'] }
}]
