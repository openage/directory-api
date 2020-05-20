'use strict'

const db = require('../models')

const populate = ''

const set = async (model, entity, context) => {
    if (model.code && entity.code !== model.code.toLowerCase()) {
        let exists = await db.department.findOne({
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

const getNewCode = async (field, context) => {
    let lock = await context.lock(`organization:${context.organization.id}:${field}`)

    let organization = await db.organization.findById(context.organization.id)

    let newCode = (organization[field] || 0) + 1

    organization[field] = newCode

    await organization.save()

    lock.release()

    return '' + newCode
}

const getNewDepartmentCode = async (options, context) => {
    // let code = options.name.split(' ').join('').toLowerCase()

    return getNewCode('lastDepartmentCode', context)
}

exports.create = async (model, context) => {
    let log = context.logger.start('services/departments:create')
    if (!model.name) {
        throw new Error('name is needed')
    }

    if (!model.code) {
        model.code = await getNewDepartmentCode({
            name: model.name
        }, context)
    }
    let entity = await db.department.findOne({
        code: model.code.toLowerCase(),
        organization: context.organization.id
    })

    if (entity) {
        throw new Error('CODE_EXISTS')
    }

    entity = new db.department({
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
    let log = context.logger.start('services/departments:update')

    let entity = await db.department.findById(id)

    await set(model, entity, context)
    await entity.save()

    log.end()
    return entity
}

exports.remove = async (id, context) => {
    let log = context.logger.start('services/departments:remove')

    return this.update(id, {
        status: 'inactive'
    }, context)
}

exports.search = async (query, paging, context) => {
    let log = context.logger.start('services/departments:search')
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

    const count = await db.department.find(where).count()
    let items
    if (paging) {
        items = await db.department.find(where).sort(sort).skip(paging.skip).limit(paging.limit).populate(populate)
    } else {
        items = await db.department.find(where).sort(sort).populate(populate)
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

    let department
    if (typeof query === 'string') {
        if (query.isObjectId()) {
            department = await db.department.findById(query)
        } else {
            department = await db.department.findOne({
                code: query.toLowerCase(),
                organization: context.organization
            })
        }
        if (department) {
            return department
        }
    }
    if (query.id) {
        department = await db.department.findById(query.id)
        if (department) {
            return department
        }
    }

    if (query.code) {
        department = await db.department.findOne({
            code: {
                $regex: query.code,
                $options: 'i'
            },
            organization: context.organization.id
        })
        if (department) {
            return department
        }
    }

    if (query.name) {
        department = await db.department.findOne({
            name: {
                $regex: query.name,
                $options: 'i'
            },
            organization: context.organization.id
        })

        if (!department) {
            department = await this.create({
                name: query.name,
                code: query.code
            }, context)
        }
    }

    return department
}
