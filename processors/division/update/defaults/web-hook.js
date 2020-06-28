'use strict'
const webHook = require('../../../../helpers/web-hook')

exports.process = async (entity, context) => {
    await webHook.send({
        entity: 'division',
        action: 'update',
        when: 'after'
    }, entity, context)
}
