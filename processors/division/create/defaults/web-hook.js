'use strict'
const webHook = require('../../../../helpers/web-hook')

exports.process = async (entity, context) => {
    await webHook.send({
        entity: 'division',
        action: 'create',
        when: 'after'
    }, entity, context)
}
