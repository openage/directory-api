module.exports = [{
    url: '/',
    post: {
        'parameters': [{
            'name': 'body',
            'in': 'body',
            'description': 'designation in EMS',
            'required': true
        }, {
            'name': 'x-role-key',
            'in': 'header',
            'description': 'Role key of the owner',
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
    get: {
        'parameters': [{
            'name': 'x-role-key',
            'in': 'header',
            'description': 'Role Key of any employee',
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
    }
}, {
    url: '/{id}',
    get: {
        'summary': 'Get single designations',
        'description': 'get designations',
        'parameters': [{
            'name': 'x-role-key',
            'in': 'header',
            'description': 'Role Key of any employee',
            'required': true,
            'type': 'string'
        }, {
            'name': 'id',
            'in': 'path',
            'description': 'designation Id',
            'required': true
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
    put: {
        'parameters': [{
            'name': 'body',
            'in': 'body',
            'description': 'designation in EMS',
            'required': true
        }, {
            'name': 'id',
            'in': 'path',
            'description': 'designation Id',
            'required': true
        }, {
            'name': 'x-role-key',
            'in': 'header',
            'description': 'Role key of the owner',
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
    }
}]
