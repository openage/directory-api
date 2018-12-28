'use strict'

let _ = require('underscore')
let logger = require('@open-age/logger')('services/designations')
let updationScheme = require('../helpers/updateEntities')
const db = require('../models')

const create = async (model, context) => {
    logger.start('create')
    model.organization = context.organization
    let query = {
        code: model.code,
        organization: context.organization.id
    }
    let designation = await db.designation.findOrCreate(query, model)

    return db.designation.findById(designation.result.id).populate('organization')
}

const update = async (model, designation) => {
    logger.start('update')

    updationScheme.update(model, designation)
    return designation.save()
}

const get = async (query, context) => {
    logger.start('get')
    if (typeof query === 'string') {
        if (query.isObjectId()) {
            return db.designation.findById(query)
        } else {
            return await db.designation.findOne({
                code: query,
                organization: context.organization.id
            }) || create({
                code: query,
                name: query
            }, context)
        }
    }
    if (query.id) {
        return db.designation.findById(query.id)
    }

    if (query.code) {
        return await db.designation.findOne({
            code: query.code,
            organization: context.organization.id
        }) || create({
            code: query.code,
            name: query.name || query.code
        }, context)
    }
    if (query.name) {
        return await db.designation.findOne({
            name: query.name,
            organization: context.organization.id
        }) || create({
            code: query.code || query.name,
            name: query.name
        }, context)
    }

    return null
}

const getById = async (id) => {
    logger.start('getById')

    return db.designation.findById(id)
}

const search = async (query, context) => {
    logger.start('search')
    query = query || {}
    if (!query.code) {
        query.code = { '$ne': 'default' }
    }

    query.organization = context.organization.id
    let designations = await db.designation.find(query)
    return designations
}

const designationManager = async (name, context) => {
    context.logger.start('designationManager')

    let designationName = name ? name.toLowerCase() : null

    if (!designationName) { return }

    let designationCode = ''
    if (designationName.split(' ').length === 1) {
        designationCode = designationName
    } else {
        _.each(designationName.split(' '), word => {
            designationCode += word.charAt(0)
        })
    }

    return create({ name: designationName, code: designationCode }, context)
}
exports.get = get
exports.create = create
exports.update = update
exports.getById = getById
exports.search = search
exports.designationManager = designationManager
