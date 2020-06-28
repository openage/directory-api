'use strict'
const webHook = require('../../../../helpers/web-hook')

exports.process = async (entity, context) => {
    await webHook.send({
        entity: 'organization',
        action: 'inactive',
        when: 'after'
    }, entity, context)
}
