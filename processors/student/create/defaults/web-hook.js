'use strict'
const roleGetter = require('../../../../services/role-getter')
const webHook = require('../../../../helpers/web-hook')

exports.process = async (entity, context) => {
    entity.role = await roleGetter.get({ employee: entity }, context)

    await webHook.send({
        entity: 'student',
        action: 'create',
        when: 'after'
    }, entity, context)
}
