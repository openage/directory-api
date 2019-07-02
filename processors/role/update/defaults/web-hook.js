'use strict'
const webHook = require('../../../../helpers/web-hook')

exports.process = async (role, context) => {
    for (const service of context.tenant.services) {
        await webHook.send('role', 'onUpdate', role, service, context)
    }
}
