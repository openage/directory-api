'use strict'
const Guid = require('guid')
const db = require('../models')

const shortid = require('shortid')

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

    if (model.meta) {
        entity.meta = model.meta
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

    if (model.navs) {
        entity.navs = []

        for (const nav of model.navs) {
            entity.navs.push(nav)
        }
    }

    if (model.styles != undefined) {
        entity.styles = model.styles
    }

    if (model.social) {
        entity.social = []

        for (const social of model.social) {
            entity.social.push({
                model: {
                    code: social.model ? social.model.code : 'default'
                },
                config: social.config
            })
        }
    }

    if (model.rebranding != undefined) {
        entity.rebranding = model.rebranding
    }

    if (model.services && model.services.length) {
        entity.services = model.services.map(s => {
            return {
                code: s.code,
                name: s.name,
                url: s.url
            }
        })
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
    let entity = await this.get(id, context)
    await set(model, entity, context)
    await entity.save()
    return entity
}

const getById = async (id, context) => {
    context.logger.start('services/tenants:getById')

    return db.tenant.findById(id).populate('owner')
}

const getByCode = async (code, context) => {
    context.logger.start('services/tenants:getByCode')

    if (code === 'my') {
        return context.tenant
    }

    return db.tenant.findOne({ code: code.toLowerCase() }).populate('owner')
}

const getByHost = async (host, context) => {
    context.logger.start('services/tenants:getByHost')
    return db.tenant.findOne({ host: host.toLowerCase() }).populate('owner')
}

exports.get = async (query, context) => {
    if (typeof query === 'string') {
        if (query.isObjectId()) {
            return db.tenant.findById(query).populate('owner')
        }
        if (query.startsWith('host:')) {
            return getByHost(query.substring(5), context)
        } else {
            return getByCode(query, context)
        }
    } else if (query.id) {
        return db.tenant.findById(query.id).populate('owner')
    } else if (query.code) {
        return getByCode(query.code, context)
    } else if (query.host) {
        return getByHost(query.host, context)
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

exports.newCode = async (code, context) => {
    // if (code) {
    //     shortid.characters(`0123456789${code}`)
    // } else {
    //     shortid.characters('0123456789abcdefghijklmnopqrstuvwxyz')
    // }

    code = shortid.generate().toLowerCase()

    let entity = await this.get(code, context)

    if (!entity) {
        return code
    }

    return this.newCode(code, context)
}

exports.getById = getById
exports.getByCode = getByCode
