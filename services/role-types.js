'use strict'

const db = require('../models')

const populate = ''

const set = async (model, entity, context) => {
    if (model.code) {
        entity.code = model.code.toLowerCase()
    }

    if (model.name) {
        entity.name = model.name
    }

    if (model.description) {
        entity.description = model.description
    }

    if (model.permissions) {
        entity.permissions = (model.permissions || []).map(p => p.toLowerCase())
    }

    if (model.status) {
        entity.status = model.status
    }

    return entity
}

exports.create = async (model, context) => {
    let entity = await this.get(model, context)
    if (!entity) {
        entity = new db.roleType({
            status: "active",
            tenant: context.tenant
        })
    }

    if (!model.permissions && !entity.permissions) {
        model.permissions = [model.code.toLowerCase()]
    }

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
        return db.roleType.findOne(where)
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
        status: 'active',
        tenant: context.tenant
    }

    if (query.name) {
        where.name = {
            '$regex': '^' + query.name,
            $options: 'i'
        }
    }

    if (query.status) {
        where['status'] = query.status
    }

    if (query.code) {
        where['code'] = query.code
    }

    // if (query.organization) {
    //     where.code = {
    //         $regex: '^' + context.organization.type,
    //         $options: 'i'
    //     }
    // }

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

exports.remove = async (id, context) => {
    let log = context.logger.start('services/batches:remove')
    return this.update(id, {
        status: 'inactive'
    }, context)
}
