'use strict'

const db = require('../models')

const populate = 'courses'

const set = async (model, entity, context) => {
    if (model.code && entity.code !== model.code.toLowerCase()) {
        let exists = await db.division.findOne({
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

    if (model.address) {
        entity.address = model.address
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

const getNewDivisionCode = async (options, context) => {
    return getNewCode('lastDivisionCode', context)
}

exports.create = async (model, context) => {
    let log = context.logger.start('services/divisions:create')
    if (!model.name) {
        throw new Error('name is needed')
    }

    if (!model.code) {
        model.code = await getNewDivisionCode({
            name: model.name
        }, context)
    }
    let entity = await db.division.findOne({
        code: model.code.toLowerCase(),
        organization: context.organization
    })

    if (entity) {
        throw new Error('CODE_EXISTS')
    }

    entity = new db.division({
        code: model.code.toLowerCase(),
        name: model.name,
        organization: context.organization,
        tenant: context.tenant
    })

    await set(model, entity, context)
    await entity.save()

    log.end()

    return entity
}

exports.update = async (id, model, context) => {
    let log = context.logger.start('services/divisions:update')
    let entity = await db.division.findById(id)

    await set(model, entity, context)
    await entity.save()

    log.end()
    return entity
}

exports.remove = async (id, context) => {
    let log = context.logger.start('services/divisions:update')

    return this.update(id, {
        status: 'inactive'
    }, context)
}

exports.search = async (query, paging, context) => {
    let log = context.logger.start('services/divisions:search')
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
        organization: context.organization.id,
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

    const count = await db.division.find(where).count()
    let items
    if (paging) {
        items = await db.division.find(where).sort(sort).skip(paging.skip).limit(paging.limit).populate(populate)
    } else {
        items = await db.division.find(where).sort(sort).populate(populate)
    }
    log.end()

    return {
        count: count,
        items: items
    }
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

    let division
    if (typeof query === 'string') {
        if (query.isObjectId()) {
            division = await db.division.findById(query).populate('courses')
        } else {
            division = await db.division.findOne({
                code: query.toLowerCase(),
                organization: context.organization
            }).populate('courses')
        }
        if (division) {
            return division
        }
    }
    if (query.id) {
        division = await db.division.findById(query.id).populate('courses')
        if (division) {
            return division
        }
    }

    if (query.code) {
        division = await db.division.findOne({
            code: {
                $regex: query.code,
                $options: 'i'
            },
            organization: context.organization.id
        }).populate('courses')
        if (division) {
            return division
        }
    }

    if (query.name) {
        division = await db.division.findOne({
            name: {
                $regex: query.name,
                $options: 'i'
            },
            organization: context.organization.id
        }).populate('courses')

        if (!division) {
            division = await this.create({
                name: query.name,
                code: query.code
            }, context)
        }
    }

    return division
}
