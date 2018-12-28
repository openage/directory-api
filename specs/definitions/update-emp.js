module.exports = [{
    name: 'updateEmp',
    required: 'user',
    properties: {
        'email': {
            'type': 'string'
        },
        'code': {
            'type': 'string'
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
        },
        'profile': {
            'type': 'object',
            'properties': {
                'dob': {
                    'type': 'string'
                },

                'fatherName': {
                    'type': 'string'
                },
                'bloodGroup': {
                    'type': 'string'
                },
                'gender': {
                    'type': 'string'
                }
            }
        },
        'role': {
            'type': 'object',
            'properties': {
                'code': {
                    'type': 'string'
                }
            }
        }
    }
}]
