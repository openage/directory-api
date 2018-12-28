'use strict'
const db = require('../models')
const userService = require('./users')
const roleService = require('./roles')
// const shortid = require('shortid')

const create = async (model, context) => {
    let log = context.logger.start('services/dependents:create')
    let dependentUser = null

    let query = {
        $or: []
    }

    if (model.phone) {
        query.$or.push({ phone: model.phone })
    }

    if (model.email) {
        query.$or.push({ email: model.email })
    }

    if (query.$or.length) {
        dependentUser = await db.user.findOne(query)
    }

    if (!dependentUser) {
        dependentUser = await userService.create(model, context)
    } else {
        dependentUser = await userService.update(model, dependentUser, context)
    }

    let dependentRole = await db.role.findOne({
        user: dependentUser.id,
        organization: { $exists: false },
        employee: { $exists: false }
    }) || await roleService.create({
        user: dependentUser,
        tenant: context.tenant.id,
        // code: shortid.generate()
    }, context)

    await roleService.update({
        dependents: [{
            role: dependentRole.id,
            relation: model.relation
        }]
    }, context.role, context)

    log.end()
    return dependentUser
}

exports.create = create
