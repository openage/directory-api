'use strict'

const communications = require('../../../../services/communications')
const roles = require('../../../../services/roles')
const db = require('../../../../models')

exports.process = async (data, context) => {
    const employee = await db.employee.findById(data.id)
    let supervisorRole = null
    let supervisorRoleKey

    if (employee.supervisor) {
        supervisorRole = await db.role.get({
            employee: employee.supervisor
        })
        supervisorRoleKey = supervisorRole ? supervisorRole.key : null
    }

    const role = await roles.get({
        employee: employee,
        organization: context.organization
    }, context)

    context.logger.info(`sending message to ${context.organization.owner.key}`)

    return communications.send({
        name: employee.name,
        id: employee.id,
        tenantKey: context.tenant.key,
        orgCode: context.organization.code
    },
    'notify-admin-on-employee-creation', [{ roleKey: supervisorRoleKey || context.organization.owner.key }],
    role.key, ['push']
    ).then((communications) => {
        context.logger.info('push delivered')
    })
}
