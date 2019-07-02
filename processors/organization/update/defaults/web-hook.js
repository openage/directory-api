'use strict'
const webHook = require('../../../../helpers/web-hook')

exports.process = async (entity, context) => {
    for (const service of context.tenant.services) {
        await webHook.send('organization', 'onUpdate', entity, service, context)
    }
}
