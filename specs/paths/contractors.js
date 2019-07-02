module.exports = [{
    url: '/',
    post: {
        'description': 'organization owner can create contractor',
        'parameters': [{
            'name': 'body',
            'in': 'body',
            'description': 'Contractor Details',
            'required': true
        }, {
            'name': 'x-role-key',
            'in': 'header',
            'description': 'role key of the organization owner',
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
    get: {
        'parameters': [{
            'name': 'x-role-key',
            'in': 'header',
            'description': 'Role key of employee',
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
    }
}]
