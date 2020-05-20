const service = require('../services/tenants')
let api = require('./api-base')('tenants', 'tenant')

api.exists = async (req) => {
    let entity = await service.get(req.params.code, req.context)

    let data = {
        isAvailable: !entity // false if exist
    }

    if (!data.isAvailable) {
        data.code = await service.newCode(req.params.code, req.context)
    } else {
        data.code = req.params.code
    }
    return data
}

api.new = async (req) => {
    return {
        code: await service.newCode('', req.context)
    }
}

module.exports = api
