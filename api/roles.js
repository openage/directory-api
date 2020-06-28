'use strict'

const mapper = require('../mappers/role')
const roleService = require('../services/roles')
const dependentService = require('../services/dependents')

const paging = require('../helpers/paging')

exports.get = async (req) => {
    let role = await roleService.get(req.params.id, req.context)
    if (!role) {
        throw new Error(`ID_INVALID`)
    }

    return mapper.toModel(role, req.context)
}

exports.search = async (req) => {
    let page = await roleService.search(req.query, paging.extract(req), req.context)
    page.items = mapper.toSummarySearchModel(page.items, req.context)
    return page
}

exports.create = async (req) => {
    req.body.user = req.body.user || req.context.user
    let role = await roleService.create(req.body, req.context)
    return mapper.toModel(role, req.context)
}

exports.update = async (req) => {
    let role = await roleService.update(req.params.id, req.body, req.context)
    return mapper.toModel(role, req.context)
}

exports.codeAvailable = async (req) => {
    let role = await roleService.getByCode(req.body.code, req.context)

    return {
        isAvailable: !role
    }
}

exports.createDependent = async (req) => {
    let log = req.context.logger.start('api/dependents:createDependent')

    const id = req.params.id !== 'my' ? req.params.id : req.context.role.id

    await dependentService.create(req.body, id, req.context)

    let headRoleWithDependent = await roleService.getWithDependent(id, req.context)

    log.end()
    return mapper.toModel(headRoleWithDependent, req.context)
}

exports.createDependentsInBulk = async (req) => {
    let log = req.context.logger.start('api/dependents:bulk')

    const id = req.params.id !== 'my' ? req.params.id : req.context.role.id

    const dependents = req.body.dependents || req.body.items

    for (let index = 0; index < dependents.length; index++) {
        let dependentModel = dependents[index]
        await dependentService.create(dependentModel, id, req.context)
    }

    let headRoleWithDependent = await roleService.getWithDependent(id, req.context)

    log.end()
    return mapper.toModel(headRoleWithDependent, req.context)
}
