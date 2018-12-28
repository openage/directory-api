module.exports = [{
    url: '/',
    post: { parameters: ['x-role-key'] },
    get: {
        parameters: ['x-role-key',
            {
                'name': 'type',
                'in': 'query',
                'description': 'set organization type',
                'required': false,
                'type': 'string'
            }]
    }
}, {
    url: '/{id}',
    put: { parameters: ['x-role-key'] },
    get: {
        parameters: ['x-role-key']
    }

}, {
    url: '/isAvailable',
    post: {
        description: 'check organization code is available',
        parameters: [
            'x-role-key',
            {
                name: 'body', in: 'body', description: 'organization code', required: true,
                schema: {
                    $ref: '#/definitions/isAvailableReq'
                }
            }
        ],
        responses: {
            default: {
                description: 'Unexpected error',
                schema: {
                    $ref: '#/definitions/isAvailableRes'
                }
            }
        }
    }
}]
