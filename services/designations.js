'use strict'

let logger = require('@open-age/logger')('services/designations')
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

const getNewDesignationCode = async (options, context) => {
    return getNewCode('lastDesignationCode', context)
}
const create = async (model, context) => {
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
        code: model.code,
        organization: context.organization.id
    })

    if (entity) {
        throw new Error('designation code ' + model.code + ' already exists')
    }

    entity = await new db.designation({
        code: model.code.toLowerCase(),
        name: model.name,
        level: model.level || 1,
        organization: context.organization
    }).save()

    log.end()

    return entity
}

const update = async (model, entity, context) => {
    context.logger.debug('services/designations:update')

    if (model.code) {
        if (entity.code.toLowerCase() !== model.code.toLowerCase()) {
            let exists = await db.designation.findOne({
                code: model.code,
                organization: context.organization.id
            })

            if (exists) {
                throw new Error('designation code ' + model.code + ' with status ' + exists.status + ' already exists')
            }
        }

        entity.code = model.code
    }

    if (model.name) {
        entity.name = model.name
    }

    if (model.level) {
        entity.level = model.level
    }

    return entity.save()
}

const get = async (query, context) => {
    context.logger.start('get')
    if (!query) {
        query = { code: 'default', name: 'Default' }
    }
    let designation
    if (typeof query === 'string') {
        if (query.isObjectId()) {
            designation = await db.designation.findById(query)
        } else {
            designation = await db.designation.findOne({
                code: {
                    $regex: query.code,
                    $options: 'i'
                },
                organization: context.organization.id
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
            designation = await create({
                name: query.name,
                code: query.code
            }, context)
        }
    }

    return designation
}

const getById = async (id) => {
    return db.designation.findById(id)
}

const search = async (query, context) => {
    let log = context.logger.start('services/designations:search')

    query = query || {}
    let where = {
        organization: context.organization.id,
        status: query.status || 'active'
    }

    // if (query.name) {
    //     where['name'] = {
    //         $regex: query.name,
    //         $options: 'i'
    //     }
    // }
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

    let designations = await db.designation.find(where)

    log.end()
    return designations
}

exports.get = get
exports.create = create
exports.update = update
exports.getById = getById
exports.search = search
