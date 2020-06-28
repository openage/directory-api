'use strict'
const gateway = require('@open-age/gateway-client')
const mapper = require('../../mappers/employee')

const roleGetter = require('../../services/role-getter')
const rolesService = require('../../services/roles')

exports.process = async (entity, context) => {
    let role = await roleGetter.get({ employee: entity }, context)
    await rolesService.update(role.id, { status: 'active' }, context)

    entity.role = role

    await gateway.tasks.create({
        template: {
            code: 'directory|employee-onboard'
        },
        entity: {
            type: 'employee',
            id: entity.code
        },
        meta: {
            employee: mapper.toModel(entity, context),
            date: new Date().toISOString(),
            reason: 'New Joining'
        }
    }, context)
}
