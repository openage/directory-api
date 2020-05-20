'use strict'

const db = require('../models')

let populate = ''

const set = async (model, entity, context) => {
    if (model.code && entity.code !== model.code.toLowerCase()) {
        let exists = await db.batch.findOne({
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

    if (model.status) {
        entity.status = model.status
    }

    return entity
}

const getNewBatchCode = async (options, context) => {
    const field = 'lastBatchCode'
    let lock = await context.lock(`organization:${context.organization.id}:${field}`)

    let organization = await db.organization.findById(context.organization.id)

    let newCode = (organization[field] || 0) + 1

    organization[field] = newCode

    await organization.save()

    lock.release()

    return `${newCode}`
}

exports.create = async (model, context) => {
    let log = context.logger.start('services/batches:create')
    if (!model.name) {
        throw new Error('name is needed')
    }

    if (!model.code) {
        model.code = await getNewBatchCode({
            date: new Date(),
            name: model.name
        }, context)
    }
    let entity = await db.batch.findOne({
        code: model.code.toLowerCase(),
        organization: context.organization
    })

    if (entity) {
        throw new Error('CODE_EXISTS')
    }

    entity = new db.batch({
        code: model.code.toLowerCase(),
        name: model.name,
        status: 'active',
        organization: context.organization,
        tenant: context.tenant
    })

    await set(model, entity, context)
    await entity.save()

    log.end()
    return entity
}

exports.update = async (id, model, context) => {
    let log = context.logger.debug('services/batches:update')
    let entity = await db.batch.findById(id)

    await set(model, entity, context)
    await entity.save()

    log.end()
    return entity
}

exports.remove = async (id, context) => {
    let log = context.logger.start('services/batches:remove')

    return this.update(id, {
        status: 'inactive'
    }, context)
}

exports.search = async (query, paging, context) => {
    context.logger.start('services/batches:search')
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
        organization: context.organization
    }
    if (query.status) {
        where['status'] = query.status
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
    }

    const count = await db.batch.find(where).count()
    let items
    if (paging) {
        items = await db.batch.find(where).sort(sort).skip(paging.skip).limit(paging.limit).populate(populate)
    } else {
        items = await db.batch.find(where).sort(sort).populate(populate)
    }

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

    let where = {
        organization: context.organization
    }

    let id

    if (typeof query === 'string') {
        if (query === 'my') {
            if (context.student && context.student.batch) {
                if (context.student.batch._doc) {
                    return context.student.batch
                } else {
                    id = context.student.batch.toString()
                }
            } else {
                return
            }
        } else if (query.isObjectId()) {
            id = query
        } else {
            where.code = query.toLowerCase()
        }
    } else if (query.id) {
        id = query.id
    } else if (query.code) {
        where.code = query.code.toLowerCase()
    } else {
        return
    }

    return (id ? db.batch.findById(id) : db.batch.findOne(where))
        .populate(populate)
}
