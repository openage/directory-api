'use strict'

const mapper = require('../mappers/role-type')
const service = require('../services/role-types')

exports.create = async (req) => {
    let newRoleType = await service.create(req.body, req.context)
    return mapper.toModel(newRoleType, req.context)
}

exports.search = async (req) => {
    let result = await service.search(req.query, null, req.context)
    return mapper.toSearchModel(result.items, req.context)
}

exports.update = async (req) => {
    let roleType = service.update(req.params.id, req.body, req.context)
    return mapper.toModel(roleType, req.context)
}
