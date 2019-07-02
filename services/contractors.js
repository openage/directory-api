'use strict'

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

const getNewContractorCode = async (options, context) => {
    // let code = options.name.split(' ').join('').toLowerCase()

    return getNewCode('lastContractorCode', context)
}

const create = async (model, context) => {
    let log = context.logger.start('services/contractors:create')
    if (!model.name) {
        throw new Error('name is needed')
    }

    if (!model.code) {
        model.code = await getNewContractorCode({
            name: model.name
        }, context)
    }
    let contractor = await db.contractor.findOne({
        code: model.code,
        organization: context.organization.id
    })

    if (contractor) {
        throw new Error('contractor code ' + model.code + ' with status ' + contractor.status + ' already exists')
    }

    contractor = await new db.contractor({
        code: model.code.toLowerCase(),
        name: model.name,
        organization: context.organization
    }).save()

    log.end()

    return contractor
}

const update = async (model, entity, context) => {
    context.logger.debug('services/contractors:update')

    if (model.code && entity.code.toLowerCase() !== model.code.toLowerCase()) {
        let exists = await db.contractor.findOne({
            code: model.code,
            organization: context.organization.id
        })

        if (exists) {
            throw new Error(`contractor with code '${model.code}' already exists`)
        }

        entity.code = model.code
    }

    if (model.name) {
        entity.name = model.name
    }

    return entity.save()
}

const search = async (query, context) => {
    let log = context.logger.start('services/contractors:search')
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

    let items = await db.contractor.find(where)

    log.end()

    return items
}

const get = async (query, context) => {
    context.logger.start('get')
    let contractor
    if (typeof query === 'string') {
        if (query.isObjectId()) {
            contractor = await db.contractor.findById(query)
        } else {
            contractor = await db.contractor.findOne({
                code: {
                    $regex: query.code,
                    $options: 'i'
                },
                organization: context.organization.id
            })
        }
        if (contractor) {
            return contractor
        }
    }
    if (query.id) {
        contractor = await db.contractor.findById(query.id)
        if (contractor) {
            return contractor
        }
    }

    if (query.code) {
        contractor = await db.contractor.findOne({
            code: {
                $regex: query.code,
                $options: 'i'
            },
            organization: context.organization.id
        })
        if (contractor) {
            return contractor
        }
    }

    if (query.name) {
        contractor = await db.contractor.findOne({
            name: {
                $regex: query.name,
                $options: 'i'
            },
            organization: context.organization.id
        })

        if (!contractor) {
            contractor = await create({
                name: query.name,
                code: query.code
            }, context)
        }
    }

    return contractor
}

exports.get = get
exports.create = create
exports.update = update
exports.search = search
