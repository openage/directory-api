module.exports = [{
    name: 'appReq',
    properties: {
        'name': {
            'type': 'string'
        },
        'code': {
            'type': 'string'
        },
        'owner': {
            'type': 'object',
            'properties': {
                'name': {
                    'type': 'string'
                },
                'email': {
                    'type': 'string'
                }
            }
        }

    }
}]
