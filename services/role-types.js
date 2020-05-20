'use strict'

const db = require('../models')

const populate = ''

const set = async (model, entity, context) => {
    if (model.name) {
        entity.name = model.name
    }

    if (model.permissions) {
        entity.permissions = model.permissions
    }
    return entity
}

exports.create = async (model, context) => {
    let entity = new db.roleType({
        code: model.code.toLowerCase(),
        permissions: model.permissions || [model.code.toLowerCase()],
        tenant: context.tenant
    })

    await set(model, entity, context)
    await entity.save()
    return entity
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
    let log = context.logger.start('services/role-types:update')
    let entity = await db.roleType.findById(id)
    await set(model, entity, context)
    await entity.save()
    log.end()
    return entity
}

exports.search = async (query, paging, context) => {
    let log = context.logger.start('services/role-types:search')
    let sorting = ''
    if (paging && paging.sort) {
        sorting = paging.sort
    }

    let sort = {}

    switch (sorting) {
        default:
            sort['code'] = 1
            break
    }

    query = query || {}
    let where = {
        tenant: context.tenant
    }

    if (context.organization) {
        where.code = {
            $regex: '^' + context.organization.type,
            $options: 'i'
        }
    }

    const count = await db.roleType.find(where).count()
    let items
    if (paging) {
        items = await db.roleType.find(where).sort(sort).skip(paging.skip).limit(paging.limit).populate(populate)
    } else {
        items = await db.roleType.find(where).sort(sort).populate(populate)
    }
    log.end()

    return {
        count: count,
        items: items
    }
}
