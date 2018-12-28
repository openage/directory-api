module.exports = [{
    url: '/',
    post: {
        parameters: [{
            name: 'body',
            in: 'body',
            description: 'First Time in EMS',
            required: true
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
        description: 'use this to update the web hooks of the app',
        parameters: [{
            name: 'body',
            in: 'body',
            description: '',
            required: true
        }, {
            name: 'id',
            in: 'path',
            description: '',
            required: true
        }]
    }
}]
