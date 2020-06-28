'use strict'
const webHook = require('../../../../helpers/web-hook')

exports.process = async (entity, context) => {
    await webHook.send({
        entity: 'role',
        action: 'create',
        when: 'after'
    }, entity, context)
}
