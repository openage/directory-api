module.exports = [{
    url: '/',
    post: {
        summary: 'send an OTP (create if required)',
        description: 'Creates a new user(if it does not exist) and sends an OTP to mobile or email. You may want to confirm the OTP in verify OTP call',
        parameters: [{
            name: 'body',
            in: 'body',
            description: 'user phone or email required',
            required: true
        }, {
            name: 'x-tenant-code',
            in: 'header',
            description: 'Tenant Code',
            required: true
        }],
        responses: {
            default: {
                description: 'Unexpected error',
                schema: {
                    $ref: '#/definitions/usersCreateResponseRes'
                }

            }
        }
    },
    get: {
        parameters: [
            'x-role-key',
            { name: 'phone', in: 'query', description: 'user phone no', required: false, type: 'string' },
            { name: 'name', in: 'query', description: 'user name or no', required: false, type: 'string' },
            { name: 'isTemporary', in: 'query', description: 'true for temporary user', required: false, type: 'string' },
            { name: 'isEmailValidate', in: 'query', description: 'true', required: false, type: 'string' },
            { name: 'isPhoneValidate', in: 'query', description: 'true', required: false, type: 'string' }
        ]
    }
}, {
    url: '/confirm',
    post: {
        summary: 'verify OTP',
        description: 'Verifies OTP and user with roles is returned',
        parameters: [{
            name: 'body',
            in: 'body',
            description: 'pin verification',
            required: true,
            schema: {
                '$ref': '#/definitions/usersConfirmReq'
            }
        }, {
            name: 'x-tenant-code',
            in: 'header',
            description: 'Tenant-Code',
            required: true
        }],
        responses: {
            default: {
                description: 'Unexpected error',
                schema: {
                    $ref: '#/definitions/usersUpdateResponseRes'
                }
            }
        }
    }
}, {
    url: '/resend',
    post: {
        summary: 'verify OTP',
        description: 'Verifies OTP and user with roles is returned',
        parameters: [{
            name: 'body',
            in: 'body',
            description: 'pin verification',
            required: true,
            schema: {
                '$ref': '#/definitions/usersResendReq'
            }
        }, {
            name: 'x-tenant-code',
            in: 'header',
            description: 'Tenant-Code',
            required: true
        }],
        responses: {
            default: {
                description: 'Unexpected error',
                schema: {
                    $ref: '#/definitions/usersCreateResponseRes'
                }
            }
        }
    }
}, {
    url: '/{id}',
    put: {
        summary: 'update user',
        description: 'update user with basic info',
        parameters: [{
            name: 'x-role-key',
            in: 'header',
            description: 'User role key',
            required: true
        }, {
            name: 'id',
            in: 'path',
            description: 'userId or my',
            required: true
        }],
        responses: {
            default: {
                description: 'Unexpected error',
                schema: {
                    $ref: '#/definitions/usersUpdateResponseRes'
                }
            }
        }
    },
    get: {
        description: 'get user with roles',
        parameters: [{
            name: 'x-role-key',
            in: 'header',
            description: 'User role key',
            required: true
        }, {
            name: 'id',
            in: 'path',
            description: 'userId or my',
            required: true
        }],
        responses: {
            default: {
                description: 'Unexpected error',
                schema: {
                    $ref: '#/definitions/usersUpdateResponseRes'
                }
            }
        }

    }
}]
