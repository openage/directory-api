'use strict'

const db = require('../models')

const create = async (model, context) => {
    let log = context.logger.start('services:departments:create')

    model.organization = context.organization
    let query = {
        code: model.code,
        organization: context.organization.id
    }
    let department = await db.department.findOrCreate(query, model)

    log.end()

    return db.department.findById(department.result.id).populate('organization')
}

const search = async (query, context) => {
    let log = context.logger.start('services:departments:search')
    query = query || {}
    if (!query.code) {
        query.code = { '$ne': 'default' }
    }
    query.organization = context.organization.id
    let items = db.department.find(query)

    log.end()

    return items
}

const get = async (query, context) => {
    let log = context.logger.start('services:departments:get')
    if (typeof query === 'string') {
        if (query.isObjectId()) {
            return db.department.findById(query)
        } else {
            return db.department.findOne({
                code: query,
                organization: context.organization.id
            }) || create({
                code: query,
                name: query
            }, context)
        }
    }
    if (query.id) {
        return db.department.findById(query.id)
    }

    if (query.code) {
        return db.department.findOne({
            code: query.code,
            organization: context.organization.id
        }) || create({
            code: query.code,
            name: query.name || query.code
        }, context)
    }
    if (query.name) {
        return db.department.findOne({
            name: query.name,
            organization: context.organization.id
        }) || create({
            code: query.code || query.name,
            name: query.name
        }, context)
    }

    log.end()

    return null
}

exports.get = get
exports.create = create
exports.search = search
