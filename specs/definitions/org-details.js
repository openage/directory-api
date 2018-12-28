module.exports = [{
    name: 'orgDetails',
    properties: {
        'name': {
            'type': 'string'
        },
        'code': {
            'type': 'string'
        },
        'shortName': {
            'type': 'string'
        },
        'type': {
            'type': 'string'
        },
        'location': {
            'type': 'object',
            'coordinates': {
                'type': 'array'
            },
            'properties': {
                'name': {
                    'type': 'string'
                },
                'description': {
                    'type': 'string'
                }
            }

        },
        'address': {
            'type': 'object',
            'properties': {
                'line1': {
                    'type': 'string'
                },
                'line2': {
                    'type': 'string'
                },
                'pinCode': {
                    'type': 'string'
                },
                'district': {
                    'type': 'string'
                },
                'city': {
                    'type': 'string'
                },
                'state': {
                    'type': 'string'
                },
                'country': {
                    'type': 'string'
                }
            }
        }
    }
}]
