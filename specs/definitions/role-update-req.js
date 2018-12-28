module.exports = [{
    name: 'roleUpdateReq',
    properties: {
        code: {
            type: 'string'
        },
        permissions: {
            type: 'array',
            items: {
                type: 'string'
            }
        },
        type: {
            properties: {
                id: {
                    type: 'string'
                },
                code: {
                    type: 'string'
                }
            }
        }
    }

}]
