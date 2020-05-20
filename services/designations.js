'use strict'

const db = require('../models')
const populate = ''

const set = async (model, entity, context) => {
    if (model.code && entity.code !== model.code.toLowerCase()) {
        let exists = await db.designation.findOne({
            code: model.code.toLowerCase(),
            organization: context.organization
        })

        if (exists) {
            throw new Error(`CODE_EXISTS`)
        }

        entity.code = model.code
    }

    if (model.name) {
        entity.name = model.name
    }

    if (model.level) {
        entity.level = model.level
    }

    if (model.status) {
        entity.status = model.status
    }

    return entity
}

const getNewCode = async (field, context) => {
    let lock = await context.lock(`organization:${context.organization.id}:${field}`)

    let organization = await db.organization.findById(context.organization.id)

    let newCode = (organization[field] || 0) + 1

    organization[field] = newCode

    await organization.save()

    lock.release()

    return '' + newCode
}

const getNewDesignationCode = async (options, context) => {
    return getNewCode('lastDesignationCode', context)
}

exports.create = async (model, context) => {
    let log = context.logger.start('services/designations:create')

    if (!model.name) {
        throw new Error('name is required')
    }
    if (!model.code) {
        model.code = await getNewDesignationCode({
            name: model.name
        }, context)
    }
    let entity = await db.designation.findOne({
        code: model.code.toLowerCase(),
        organization: context.organization
    })

    if (entity) {
        throw new Error('CODE_EXISTS')
    }

    entity = new db.designation({
        code: model.code.toLowerCase(),
        name: model.name,
        level: model.level || 1,
        organization: context.organization,
        tenant: context.tenant
    })

    await set(model, entity, context)
    await entity.save()

    log.end()

    return entity
}

exports.update = async (id, model, context) => {
    let log = context.logger.start('services/designations:update')
    let entity = await db.designation.findById(id)

    await set(model, entity, context)
    await entity.save()

    log.end()
    return entity
}

exports.remove = async (id, context) => {
    let log = context.logger.start('services/designations:update')
    return this.update(id, {
        status: 'inactive'
    }, context)
}

exports.get = async (query, context) => {
    context.logger.start('get')
    if (!query) {
        query = { code: 'default', name: 'Default' }
    }

    if (query._bsontype === 'ObjectID') {
        query = {
            id: query.toString()
        }
    }

    let designation
    if (typeof query === 'string') {
        if (query.isObjectId()) {
            designation = await db.designation.findById(query)
        } else {
            designation = await db.designation.findOne({
                code: query.toLowerCase(),
                organization: context.organization
            })
        }
        if (designation) {
            return designation
        }
    }
    if (query.id) {
        designation = await db.designation.findById(query.id)
        if (designation) {
            return designation
        }
    }

    if (query.code) {
        designation = await db.designation.findOne({
            code: {
                $regex: query.code,
                $options: 'i'
            },
            organization: context.organization.id
        })
        if (designation) {
            return designation
        }
    }

    if (query.name) {
        designation = await db.designation.findOne({
            name: {
                $regex: query.name,
                $options: 'i'
            },
            organization: context.organization.id
        })

        if (!designation) {
            designation = await this.create({
                name: query.name,
                code: query.code
            }, context)
        }
    }

    return designation
}

exports.search = async (query, paging, context) => {
    let log = context.logger.start('services/designations:search')

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
        organization: context.organization,
        status: query.status || 'active'
    }

    if (query.name) {
        where['name'] = {
            $regex: query.name,
            $options: 'i'
        }
    }

    if (query.code) {
        where['code'] = {
            $regex: query.code,
            $options: 'i'
        }
    } else {
        where['code'] = {
            $ne: 'default'
        }
    }

    const count = await db.designation.find(where).count()
    let items
    if (paging) {
        items = await db.designation.find(where).sort(sort).skip(paging.skip).limit(paging.limit).populate(populate)
    } else {
        items = await db.designation.find(where).sort(sort).populate(populate)
    }
    log.end()

    return {
        count: count,
        items: items
    }
}
