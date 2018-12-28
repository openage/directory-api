module.exports = [{
    url: '/',
    post: {
        'parameters': [{
            'name': 'body',
            'in': 'body',
            'description': 'First Time in EMS',
            'required': true
        }, {
            'name': 'org-code',
            'in': 'header',
            'description': 'Org-Code',
            'required': true
        }, {
            'name': 'tenant-api-key',
            'in': 'header',
            'description': 'Tenant Api Key',
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
        'summary': 'Get all divisions',
        'description': 'get by id',
        'parameters': [{
            'name': 'org-code',
            'in': 'header',
            'description': 'Org-Code',
            'required': true
        }, {
            'name': 'tenant-api-key',
            'in': 'header',
            'description': 'Tenant Api Key',
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
