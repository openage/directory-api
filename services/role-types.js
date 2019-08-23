'use strict'

const db = require('../models')

const set = (model, entity, context) => {
    if (model.name) {
        entity.name = model.name
    }

    if (model.description) {
        entity.description = model.description
    }

    if (model.permissions) {
        entity.permissions = model.permissions
    }
    return entity
}

exports.create = async (data, context) => {
    let roleType = new db.roleType({
        code: data.code.toLowerCase(),
        tenant: context.tenant
    })

    data.permissions = data.permissions || [data.code.toLowerCase()]

    set(data, roleType, context)
    await roleType.save()
    return roleType
}

exports.get = async (query, context) => {
    context.logger.silly('services/role-types:get')
    let entity
    let where = {
        tenant: context.tenant
    }
    if (typeof query === 'string') {
        if (query.isObjectId()) {
            return db.roleType.findById(query)
        }
        where['code'] = query.toLowerCase()
        entity = await db.roleType.findOne(where)

        if (entity) { return entity }
        return exports.create({
            code: query
        }, context)
    } else if (query.id) {
        return db.roleType.findById(query.id)
    } else if (query.code) {
        where['code'] = query.code.toLowerCase()
        entity = await db.roleType.findOne(where)
        if (entity) { return entity }
        return exports.create({
            code: query.code
        }, context)
    }
    return null
}

exports.update = async (id, model, context) => {
    context.logger.silly('services/role-types:update')
    let roleType = await db.roleType.findById(id)
    set(model, roleType, context)
    await roleType.save()
}

exports.search = async (query, paging, context) => {
    let where = {
        tenant: context.tenant
    }

    // if (context.organization) {
    //     where.code = {
    //         $regex: '^' + context.organization.type,
    //         $options: 'i'
    //     }
    // }

    return {
        items: await db.roleType.find(where)
    }
}
