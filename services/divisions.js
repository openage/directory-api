'use strict'

let logger = require('@open-age/logger')('services/divisions')
const db = require('../models')

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

const create = async (model, context) => {
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
        code: model.code,
        organization: context.organization.id
    })

    if (entity) {
        throw new Error('division code ' + model.code + ' already exists')
    }

    entity = await new db.division({
        code: model.code.toLowerCase(),
        name: model.name,
        address: model.address,
        organization: context.organization
    }).save()

    log.end()

    return entity
}

const update = async (model, entity, context) => {
    context.logger.debug('services/divisions:update')

    if (model.code) {
        if (entity.code.toLowerCase() !== model.code.toLowerCase()) {
            let exists = await db.division.findOne({
                code: model.code,
                organization: context.organization.id
            })

            if (exists) {
                throw new Error('division code ' + model.code + ' with status ' + exists.status + ' already exists')
            }
        }

        entity.code = model.code
    }

    if (model.name) {
        entity.name = model.name
    }

    return entity.save()
}

const search = async (query, context) => {
    logger.start('search')
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

    let divisions = await db.division.find(where)
    return divisions
}

const getById = async (id, context) => {
    logger.start('getById')

    return db.division.findById(id)
}

const get = async (query, context) => {
    context.logger.start('get')
    if (!query) {
        query = { code: 'default', name: 'Default' }
    }
    let division
    if (typeof query === 'string') {
        if (query.isObjectId()) {
            division = await db.division.findById(query)
        } else {
            division = await db.division.findOne({
                code: {
                    $regex: query.code,
                    $options: 'i'
                },
                organization: context.organization.id
            })
        }
        if (division) {
            return division
        }
    }
    if (query.id) {
        division = await db.division.findById(query.id)
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
        })
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
        })

        if (!division) {
            division = await create({
                name: query.name,
                code: query.code
            }, context)
        }
    }

    return division
}

exports.create = create
exports.update = update
exports.search = search
exports.getById = getById
exports.get = get
