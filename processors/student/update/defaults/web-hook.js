'use strict'
const roleService = require('../../../../services/role-getter')
const webHook = require('../../../../helpers/web-hook')

exports.process = async (entity, context) => {
    entity.role = await roleService.get({ student: entity }, context)

    await webHook.send({
        entity: 'student',
        action: 'update',
        when: 'after'
    }, entity, context)
}
