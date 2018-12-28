module.exports = [{
    name: 'roleResponse',
    properties: {
        'id': {
            'type': 'string'
        },
        'level': {
            'type': 'string'
        },
        'key': {
            'type': 'string'
        },
        'permissions': {
            'type': 'array',
            'items': {
                'type': 'string'
            }
        },
        'user': {
            'properties': {
                'id': {
                    'type': 'string'
                },
                'email': {
                    'type': 'string'
                },
                'phone': {
                    'type': 'string'
                },
                'profile': {
                    'type': 'object'
                },
                'identities': {
                    'type': 'object'
                }
            }
        },
        'employee': {
            'properties': {
                'id': {
                    'type': 'string'
                },
                'name': {
                    'type': 'string'
                },
                'code': {
                    'type': 'string'
                },
                'profile': {
                    'type': 'object'
                },
                'address': {
                    'type': 'object'
                },
                'status': {
                    'type': 'string'
                }
            }
        },
        'organization': {
            'properties': {
                'id': {
                    'type': 'string'
                },
                'name': {
                    'type': 'string'
                },
                'code': {
                    'type': 'string'
                },
                'address': {
                    'type': 'object'
                },
                'status': {
                    'type': 'string'
                }
            }
        },
        'tenant': {
            'properties': {
                'id': {
                    'type': 'string'
                },
                'name': {
                    'type': 'string'
                },
                'code': {
                    'type': 'string'
                },
                'key': {
                    'type': 'string'
                }
            }
        }
    }
}]
