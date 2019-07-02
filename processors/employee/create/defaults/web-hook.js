'use strict'
const roleGetter = require('../../../../services/role-getter')
const webHook = require('../../../../helpers/web-hook')

exports.process = async (employee, context) => {
    employee.role = await roleGetter.get({ employee: employee }, context)

    for (const service of context.tenant.services) {
        await webHook.send('employee', 'onUpdate', employee, service, context)
    }
}
