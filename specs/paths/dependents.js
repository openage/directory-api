module.exports = [{
    url: '/',
    post: {
        parameters: ['x-role-key']
    }
}, {
    url: '/bulk',
    post: {
        parameters: ['x-role-key',
            {
                name: 'body', in: 'body', required: true, schema: {
                    '$ref': '#/definitions/dependentsBulkModelReq'
                }

            }],
        responses: {
            default: {
                description: 'Unexpected error',
                schema: {
                    '$ref': '#/definitions/dependentsBulkModelRes'
                }
            }
        }
    }
}]