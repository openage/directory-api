'use strict'
const roleService = require('../../../../services/role-getter')
const webHook = require('../../../../helpers/web-hook')

exports.process = async (entity, context) => {
    entity.role = await roleService.get({ employee: entity }, context)

    await webHook.send({
        entity: 'employee',
        action: 'update',
        when: 'after'
    }, entity, context)
}
