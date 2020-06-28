'use strict'
const gateway = require('@open-age/gateway-client')
const mapper = require('../../mappers/employee')
const roleGetter = require('../../services/role-getter')
const rolesService = require('../../services/roles')
const webHook = require('../../helpers/web-hook')

exports.process = async (entity, context) => {
    let role = await roleGetter.get({ employee: entity }, context)
    await rolesService.update(role.id, { status: 'inactive' }, context)

    entity.role = role

    await webHook.send({
        entity: 'employee',
        action: 'inactive',
        when: 'after'
    }, entity, context)

    await gateway.tasks.create({
        template: {
            code: 'directory|employee-offboard'
        },
        entity: {
            type: 'employee',
            id: entity.code
        },
        meta: {
            employee: mapper.toModel(entity, context),
            date: new Date().toISOString()
        }
    }, context)
}
