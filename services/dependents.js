'use strict'
const userService = require('./users')
const roleService = require('./roles')

const roleGetter = require('./role-getter')
const userGetter = require('./user-getter')

exports.create = async (model, primaryRoleId, context) => {
    let log = context.logger.start('services/dependents:create')

    let primaryRole = await roleGetter.get(primaryRoleId, context)

    if (!primaryRole) {
        throw new Error('primary role not found')
    }

    let dependentUser = null
    let dependentRole = null

    if (model.role.id) {
        dependentRole = await roleGetter.get(model.role, context)
    } else {
        dependentUser = await userGetter.get(model.user, context)

        if (!dependentUser) {
            dependentUser = await userService.create(model.role.user, context)
            dependentRole = dependentUser.roles[0]
        } else {
            dependentUser = await userService.update(dependentUser.id, model.role.user, context)
            dependentRole = await roleGetter.getDefault(dependentUser, context)
        }
    }

    if (!dependentRole) {
        throw new Error('dependent role not found')
    }

    log.end()
    return roleService.update(primaryRole.id, {
        dependents: [{
            role: dependentRole,
            relation: model.relation
        }]
    }, context)
}
