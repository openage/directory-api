'use strict'

const mapper = require('../mappers/role-type')
const roleTypeService = require('../services/role-types')

exports.create = async (req) => {
    let log = req.context.logger.start('create')
    let newRoleType = await roleTypeService.create({
        code: req.body.code,
        permissions: req.body.permissions
    }, req.context)

    log.end()

    return mapper.toModel(newRoleType)
}

exports.search = async (req) => {
    let log = req.context.logger.start('search')

    let query = {
        tenant: req.context.tenant.id
    }

    if (req.context.organization) {
    query.code = {
        $regex: '^' + req.context.organization.type,
        $options: 'i'
    }
    }

    let roleTypeList = await db.roleType.find(query)

    log.end()

    return mapper.toSearchModel(roleTypeList)
}

exports.update = async (req) => {
    let log = req.context.logger.start('api:role-types:update')

    let model = {
        code: req.body.code,
        permissions: req.body.permissions
    }

    let roleType = roleTypeService.update(model, req.params.id, req.context)

    return mapper.toModel(roleType)
}
