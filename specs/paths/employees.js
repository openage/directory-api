module.exports = [{
    url: '.csv',
    get: { parameters: ['x-role-key'] },
    post: { parameters: ['x-role-key'] }
}, {
    url: '/',
    post: {
        'parameters': [{
            'name': 'body',
            'in': 'body',
            'description': 'employee details',
            'required': true,
            'schema': {
                '$ref': '#/definitions/signupReq'
            }
        }, {
            'name': 'tenant-code',
            'in': 'header',
            'description': 'Tenant Code',
            'required': false,
            'type': 'string'
        }, {
            'name': 'x-role-key',
            'in': 'header',
            'description': 'Role Key of the owner',
            'required': false,
            'type': 'string'
        }],
        'responses': {
            '200': {
                'description': '',
                'schema': {
                    '$ref': '#/definitions/signupRes'
                }
            },
            'default': {
                'description': 'Unexpected error',
                'schema': {
                    '$ref': '#/definitions/Error'
                }
            }
        }
    },
    get: {
        'description': 'you need to be an employee (identified from x-role-key) of that org to be able to search it',
        'parameters': [{
            'name': 'status',
            'in': 'query',
            'description': 'set status',
            'required': false,
            'type': 'string'
        }, {
            'name': 'pageNo',
            'in': 'query',
            'description': 'pageNo',
            'required': false,
            'type': 'number'
        }, {
            'name': 'serverPaging',
            'in': 'query',
            'description': 'serverPaging',
            'required': false,
            'type': 'boolean'
        }, {
            'name': 'pageSize',
            'in': 'query',
            'description': 'pageSize',
            'required': false,
            'type': 'number'
        }, {
            'name': 'type',
            'in': 'query',
            'description': 'employee type',
            'required': false,
            'type': 'string'
        }, {
            'name': 'name',
            'in': 'query',
            'description': 'employee name',
            'required': false,
            'type': 'string'
        }, {
            'name': 'x-role-key',
            'in': 'header',
            'description': 'role key of the employee',
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
}, {
    url: '/makeTunnel',
    post: {
        'summary': 'signup with token which was issued by the tenant',
        'description': 'using the tenant information the api goes to the tenant api and gets the user role for that external token',
        'parameters': [{
            'name': 'x-tenant-token',
            'in': 'header',
            'description': 'token',
            'required': true
        }, {
            'name': 'tenant-code',
            'in': 'header',
            'description': 'Tenant Code',
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
}, {
    url: '/{id}',
    put: {
        'description': 'either the tenant api or the org owner or the employee himself can update (with limits on the fields)',
        'parameters': [{
            'in': 'body',
            'description': 'to update fields',
            'required': true,
            'schema': {
                '$ref': '#/definitions/signupReq'
            }
        }, {
            'name': 'org-code',
            'in': 'header',
            'description': 'Organization Code',
            'required': false
        }, {
            'name': 'x-tenant-key',
            'in': 'header',
            'description': 'Tenant Api Key - requires org-code',
            'required': false,
            'type': 'string'
        }, {
            'name': 'x-role-key',
            'in': 'header',
            'description': 'Role key of the employee',
            'required': false,
            'type': 'string'
        }, {
            'name': 'id',
            'in': 'path',
            'description': 'id',
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
        'description': 'get employee',
        'parameters': [{
            'name': 'id',
            'in': 'path',
            'description': 'se my to get your data else \'id\'',
            'required': true
        }, {
            'name': 'x-role-key',
            'in': 'header',
            'description': 'Role key of the employee',
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
    delete: {
        'description': 'sets the employee status to in-active',
        'parameters': [{
            'name': 'id',
            'in': 'path',
            'description': 'se my to get your data else \'id\'',
            'required': true
        }, {
            'name': 'x-role-key',
            'in': 'header',
            'description': 'role key of the owner',
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
}, {
    url: '/{id}/status',
    put: {
        'summary': 'update employee status',
        'description': 'update employee status',
        'parameters': [{
            'in': 'body',
            'description': 'to update fields',
            'required': true,
            'schema': {
                '$ref': '#/definitions/delBulkReq'
            }
        }, {
            'name': 'x-access-token',
            'in': 'header',
            'description': 'token',
            'required': true,
            'type': 'string'
        }, {
            'name': 'status',
            'in': 'path',
            'description': 'set my to to update yours profile otherwise id',
            'required': true,
            'type': 'string'
        }, {
            'name': 'org-code',
            'in': 'header',
            'description': 'Org-Code',
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
}, {
    url: '/bulk',
    delete: {
        'summary': 'Delete bulk employees',
        'description': 'Delete bulk employees',
        'parameters': [{
            'in': 'body',
            'description': 'First Time in AQUA',
            'required': true,
            'schema': {
                '$ref': '#/definitions/delBulkReq'
            }
        }, {
            'name': 'org-code',
            'in': 'header',
            'description': 'Org-Code',
            'required': true
        }, {
            'name': 'x-access-token',
            'in': 'header',
            'description': 'token',
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
}, {
    url: '/bulk',
    post: {
        'summary': 'creats the employees in bulk (array in body etc)',
        'description': 'Importer',
        'parameters': [{
            'in': 'formData',
            'name': 'file',
            'type': 'file',
            'description': 'employees details XL ',
            'required': true
        }, {
            'name': 'x-role-key',
            'in': 'header',
            'description': 'role key',
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
