'use strict'

let api = require('./api-base')('employees', 'employee')

let service = require('../services/employees')
let mapper = require('../mappers/employee')

let roles = require('../services/role-getter')

api.get = async (req) => {
    let entity = await service.get(req.params.id, req.context)
    if (!entity) {
        throw new Error(`RESOURCE_NOT_FOUND`)
    }
    entity.role = await roles.get({ employee: entity }, req.context)
    return mapper.toModel(entity, req.context)
}

api.exists = async (req) => {
    let query = {}
    if (req.query.email) {
        query.email = req.query.email
    } else if (req.query.phone) {
        query.phone = req.query.phone
    } else if (req.query.code) {
        query.code = req.query.code
    }

    let entity = await service.get(query, req.context)

    return !!entity
}

module.exports = api
