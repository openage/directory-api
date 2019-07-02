module.exports = [{
    url: '/',
    post: {
        'parameters': [{
            'name': 'body',
            'in': 'body',
            'description': 'role details',
            'required': true,
            'schema': {
                '$ref': '#/definitions/rolesCreateReq'
            }
        }, {
            'name': 'x-role-key',
            'in': 'header',
            'description': 'User role key',
            'required': true
        }],
        'responses': {
            'default': {
                'description': 'Unexpected error'
            }
        }
    },
    get: {
        'description': 'get all roles of user by user-token',
        'parameters': [{
            'name': 'x-role-key',
            'in': 'header',
            'description': 'token',
            'required': true,
            'type': 'string'
        }],
        'responses': {
            'default': {
                'description': 'Unexpected error'
            }
        }
    }
}, {
    url: '/{id}',
    put: {
        'description': 'update role code',
        'parameters': [{
            'in': 'body',
            'name': 'body',
            'description': 'to update fields',
            'required': true,
            'schema': {
                '$ref': '#/definitions/roleUpdateReq'
            }
        }, {
            'name': 'id',
            'in': 'path',
            'description': 'my',
            'required': true,
            'type': 'string'
        }, {
            'name': 'x-role-key',
            'in': 'header',
            'description': 'User Role key ',
            'required': true,
            'type': 'string'
        }],
        'responses': {
            'default': {
                'description': 'Unexpected error'
            }
        }
    },
    get: {
        'description': 'get single role object',
        'parameters': [{
            'name': 'id',
            'in': 'path',
            'description': 'my',
            'required': true,
            'type': 'string'
        }, {
            'name': 'x-role-key',
            'in': 'header',
            'description': 'User Role key ',
            'required': true,
            'type': 'string'
        }],
        'responses': {
            'default': {
                'description': 'Unexpected error'
            }
        }
    }

}, {
    url: '/isAvailable',
    post: {
        'description': 'check role code is available',
        'parameters': [{
            'name': 'body',
            'in': 'body',
            'description': 'role code',
            'required': true
        }, {
            'name': 'x-role-key',
            'in': 'header',
            'description': 'User role key',
            'required': true
        }],
        'responses': {
            'default': {
                'description': 'Unexpected error'

            }
        }
    }
}, {
    url: '/{id}/dependent',
    post: {
        parameters: ['x-role-key', {
            'name': 'id',
            'in': 'path',
            'description': '"my" to add in your role or default role id of user',
            'required': true,
            'type': 'string'
        }, {
                name: 'body',
                in: 'body',
                required: true,
                schema: {
                    '$ref': '#/definitions/dependentsCreateReq'
                }
            }],
        responses: {
            default: {
                description: 'Unexpected error',
                schema: {
                    '$ref': '#/definitions/rolesRes'
                }
            }
        }
    }
}, {
    url: '/{id}/dependent/bulk',
    post: {
        parameters: ['x-role-key', {
            'name': 'id',
            'in': 'path',
            'description': '"my" to add in your role or default role id of user',
            'required': true,
            'type': 'string'
        }, {
                name: 'body',
                in: 'body',
                required: true,
                schema: {
                    '$ref': '#/definitions/dependentsBulkModelReq'
                }
            }],
        responses: {
            default: {
                description: 'Unexpected error',
                schema: {
                    '$ref': '#/definitions/rolesRes'
                }
            }
        }
    }
}]
