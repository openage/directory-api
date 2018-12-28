module.exports = [
    {
        url: '/',
        post: {
            summary: 'create an activity log',
            description: 'create an activity log ',
            tags: ['activityLogs'],
            parameters: [{
                name: 'body',
                in: 'body',
                description: 'actions are created, updated, deleted and status are active inactive',
                required: true
            }, {
                name: 'x-role-key',
                in: 'header',
                description: 'Role Key',
                required: true
            }],
            responses: {
                default: {
                    description: 'Unexpected error',
                    schema: {
                        '$ref': '#/definitions/Error'
                    }
                }
            }
        },
        get: {
            summary: 'get activity logs by query',
            description: 'get activity logs',
            tags: ['activityLogs'],
            parameters: [{
                name: 'action',
                in: 'query',
                description: 'created updated deleted',
                required: false
            }, {
                name: 'role',
                in: 'query',
                description: 'role id here if to get for specific role',
                required: false
            }, {
                name: 'status',
                in: 'query',
                description: 'active inactive',
                required: false
            }, {
                name: 'date',
                in: 'query',
                description: 'date of which you want to get activity logs',
                required: false
            }, {
                name: 'x-role-key',
                in: 'header',
                description: 'Role Key',
                required: true
            }],
            responses: {
                default: {
                    description: 'Unexpected error',
                    schema: {
                        '$ref': '#/definitions/Error'
                    }
                }
            }
        }
    }, {
        url: '/{id}',
        get: {
            summary: 'get activity logs by query',
            description: 'get activity logs',
            tags: ['activityLogs'],
            parameters: [{
                name: 'id',
                in: 'path',
                description: 'set id of activity log',
                required: true
            }, {
                name: 'x-role-key',
                in: 'header',
                description: 'Role Key',
                required: true
            }],
            responses: {
                default: {
                    description: 'Unexpected error',
                    schema: {
                        '$ref': '#/definitions/Error'
                    }
                }
            }
        }
    }]
