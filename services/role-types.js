'use strict'

const logger = require('@open-age/logger')('services/role-types')
const db = require('../models')
const updateScheme = require('../helpers/updateEntities')

const create = async (data, context) => {
    logger.start('create')
    data.tenant = context.tenant
    data.permissions = data.permissions || []

    if (data.code === 'admin' && data.permissions.indexOf('admin') === -1) {
        data.permissions.push('admin')
    }
    let roleType = await new db.roleType(data).save()
    return roleType
}

const get = async (code, context) => {
    logger.start('get')
    let roleType = await db.roleType.findOne({
        code: code,
        tenant: context.tenant.id
    })

    if (roleType !== null) {
        return roleType
    }

    return create({
        code: code,
        permissions: [code]
    }, context)
}

const update = async (model, id, context) => {
    let log = context.logger.start('services:role-types:update')

    let roleType = await db.roleType.findById(id)

    return updateScheme.update(model, roleType).save()
}

const find = async (query, context) => {
    context.logger.start('services:role-types:find')

    if (typeof query === 'string') {
        if (query.isObjectId()) {
            return db.roleType.findById(query)
        } else {
            return db.roleType.findOne({ code: query })
        }
    }

    if (query.id) {
        return db.roleType.findById(query.id)
    }

    if (query.code) {
        return db.roleType.findOne({ code: query.code })
    }

    return null
}

exports.create = create
exports.get = get
exports.update = update
exports.find = find
