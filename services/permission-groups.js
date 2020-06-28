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

    if (model.permissions && model.permissions.length) {
        entity.permissions = (model.permissions || []).map(p => {
            return {
                code: p.code,
                name: p.name,
                description: p.description
            }
        })
    }

    if (model.status) {
        entity.status = model.status
    }

    return entity
}

exports.create = async (model, context) => {
    let entity = await this.get(model, context)
    if (!entity) {
        entity = new db.permissionGroup({
            tenant: context.tenant
        })
    }

    await set(model, entity, context)
    await entity.save()
    return entity
}

exports.update = async (id, model, context) => {
    let log = context.logger.start('services/permission-groups:update')
    let entity = await this.get(id, context)
    await set(model, entity, context)
    await entity.save()
    log.end()
    return entity
}

exports.get = async (query, context) => {
    context.logger.silly('services/role-types:get')
    let where = {
        tenant: context.tenant
    }
    if (typeof query === 'string') {
        if (query.isObjectId()) {
            return db.permissionGroup.findById(query).populate(populate)
        }
        where['code'] = query.toLowerCase()
        return db.permissionGroup.findOne(where).populate(populate)
    } else if (query.id) {
        return db.permissionGroup.findById(query.id).populate(populate)
    } else if (query.code) {
        where['code'] = query.code.toLowerCase()
        return db.permissionGroup.findOne(where).populate(populate)
    }
    return null
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

    const count = await db.permissionGroup.find(where).count()
    let items
    if (paging) {
        items = await db.permissionGroup.find(where).sort(sort).skip(paging.skip).limit(paging.limit).populate(populate)
    } else {
        items = await db.permissionGroup.find(where).sort(sort).populate(populate)
    }
    log.end()

    return {
        count: count,
        items: items
    }
}

exports.filterPermissions = async (permissions, context) => {

    let log = context.logger.start('services/permission-group:filterPermissions')

    let filterd = []

    let where = {
        tenant: context.tenant
    }

    let items = await db.permissionGroup.find(where)

    for (const permission of permissions) {
        let exist = false
        items.forEach(group => {
            group.permissions.forEach(item => {
                if (item.code == permission) {
                    exist = true
                }
            })
        })
        if (exist) {
            filterd.push(permission)
        }
    }

    log.end()

    return filterd

}
