'use strict'
const webHook = require('../../../../helpers/web-hook')

exports.process = async (entity, context) => {
    context.permissions.push('organization.owner')
    // this is added so that other systems are notified under this role
    await webHook.send({
        entity: 'organization',
        action: 'create',
        when: 'after'
    }, entity, context)
}
