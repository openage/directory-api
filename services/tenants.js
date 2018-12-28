'use strict'
const logger = require('@open-age/logger')('services/apps')
const Guid = require('guid')
const db = require('../models')

const create = async (model) => {
    let log = logger.start('create')
    const guid = Guid.create()
    model.key = guid.value
    try {
        let tenant = await db.tenant.findOrCreate({ code: model.code, name: model.name }, model)

        if (tenant.created) {
            log.info('new tenant created')
        } else {
            log.info('tenant already exist')
        }

        return tenant.result
    } catch (error) {
        log.error(error)
        return error
    }
}

const getById = async (id, context) => {
    context.logger.start('services/tenants:getById')

    return db.tenant.findById(id).populate('owner')
}
const getByCode = async (code, context) => {
    context.logger.start('services/tenants:getByCode')

    return db.tenant.findOne({code: code}).populate('owner')
}

exports.create = create
exports.getById = getById
exports.getByCode = getByCode
