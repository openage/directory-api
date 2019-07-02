'use strict'
const roleService = require('../../../../services/role-getter')
const webHook = require('../../../../helpers/web-hook')

exports.process = async (employee, context) => {
    employee.role = await roleService.get({ employee: employee }, context)

    for (const service of context.tenant.services) {
        await webHook.send('employee', 'onUpdate', employee, service, context)
    }
}
