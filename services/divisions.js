'use strict'

let logger = require('@open-age/logger')('services/divisions')
const db = require('../models')

const create = async (model, context) => {
    logger.start('create')
    model.organization = context.organization.id

    let division = await new db.division(model).save()

    return db.division.findById(division.id).populate('organization')
}

const search = async (query, context) => {
    logger.start('search')
    query = query || {}
    if (!query.code) {
        query.code = { '$ne': 'default' }
    }

    let divisions = await db.division.find({ organization: context.organization.id })
    return divisions
}

const getById = async (id, context) => {
    logger.start('getById')

    return db.division.findById(id)
}

const get = async (query, context) => {
    if (typeof query === 'string') {
        if (query.isObjectId()) {
            return db.division.findById(query)
        } else {
            return await db.division.findOne({
                code: query,
                organization: context.organization.id
            }) || create({
                code: query,
                name: query
            }, context)
        }
    }
    if (query.id) {
        return db.division.findById(query.id)
    }

    if (query.code) {
        return await db.division.findOne({
            code: query.code,
            organization: context.organization.id
        }) || create({
            code: query.code,
            name: query.name || query.code
        }, context)
    }
    if (query.name) {
        return await db.division.findOne({
            name: query.name,
            organization: context.organization.id
        }) || create({
            code: query.code || query.name,
            name: query.name
        }, context)
    }

    return null
}

exports.create = create
exports.search = search
exports.getById = getById

exports.get = get
