'use strict'
const Guid = require('guid')
const db = require('../models')

const userService = require('./users')

const set = async (model, entity, context) => {
    if (model.host && model.host !== entity.host) {
        let existing = await db.tenant.findOne({
            host: model.host.toLowerCase()
        })
        if (existing) {
            throw new Error('HOST_ALREADY_EXISTS')
        }

        entity.host = model.host
    }

    if (model.name) {
        entity.name = model.name
    }

    if (model.logo) {
        entity.logo = {
            url: model.logo.url,
            thumbnail: model.logo.thumbnail
        }
    }

    if (model.config) {
        entity.config = model.config
    }
    return entity
}

exports.create = async (model, context) => {
    let entity = await getByCode(model.code, context)

    if (entity) {
        throw new Error('CODE_ALREADY_EXIST')
    }

    let tenant = new db.tenant({
        code: model.code,
        key: Guid.create().value
    })

    await set(model, tenant, context)

    await tenant.save()

    await context.setTenant(tenant)

    let user = await userService.create(model.owner, context)

    tenant.owner = user.roles[0]

    await tenant.save()
    return tenant
}

exports.update = async (id, model, context) => {
    let entity = await getById(id, context)
    await set(model, entity, context)
    return entity
}

const getById = async (id, context) => {
    context.logger.start('services/tenants:getById')

    return db.tenant.findById(id).populate('owner')
}

const getByCode = async (code, context) => {
    context.logger.start('services/tenants:getByCode')
    return db.tenant.findOne({ code: code }).populate('owner')
}

exports.get = async (query, context) => {
    let where = {
    }
    if (typeof query === 'string') {
        if (query === 'my') {
            return context.tenant
        }

        if (query.isObjectId()) {
            return db.tenant.findById(query).populate('owner')
        }
        if (query.startsWith('host:')) {
            let host = query.substring(5).toLowerCase()
            where['host'] = host

            // if (host === 'localhost:4205') {
            //     where['code'] = 'aqua'
            // } else {
            //     where['host'] = host
            // }
        } else {
            where['code'] = query.toLowerCase()
        }
        return db.tenant.findOne(where).populate('owner')
    } else if (query.id) {
        return db.tenant.findById(query.id).populate('owner')
    } else if (query.code) {
        if (query.code === 'my') {
            return context.tenant
        }
        where['code'] = query.code.toLowerCase()
        return db.tenant.findOne(where).populate('owner')
    } else if (query.host) {
        where['host'] = query.host.toLowerCase()
        return db.tenant.findOne(where).populate('owner')
    }
    return null
}

exports.search = async (query, paging, context) => {
    let where = {}

    if (query.type) {
        where.type = query.type
    }

    return { items: db.tenant.find(where) }
}

exports.getById = getById
exports.getByCode = getByCode
