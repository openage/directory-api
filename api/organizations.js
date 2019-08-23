'use strict'
const mapper = require('../mappers/organization')
const service = require('../services/organizations')

const api = require('./api-base')('organizations', 'organization')

api.get = async (req) => {
    let entity
    if (req.params.code) {
        entity = await service.get(req.params.code, req.context)
        return entity ? mapper.toSummary(entity) : null
    }

    entity = await service.get(req.params.id, req.context)
    return mapper.toModel(entity, req.context)
}

api.codeAvailable = async (req) => {
    let organization = await service.getByCode(req.body.code, req.context)

    let data = {
        isAvailable: !organization // false if exist
    }

    if (!data.isAvailable) {
        data.available = await service.availableCodeFinder(req.body.code, req.context) // suggested available code
    }
    return data
}

module.exports = api
