'use strict'

const logger = require('@open-age/logger')('processors/employee/create')
const communications = require('../../../../services/communications')
const roles = require('../../../../services/roles')
const db = require('../../../../models')

exports.process = async (data, context) => {
    logger.start('process')

    const employee = await db.employee.findById(data.id).populate('supervisor')

    const role = await roles.get({
        employee: employee
    }, context)

    logger.info(`sending message to ${role.key}`)

    return communications.send({ status: employee.status, orgType: context.organization.type },
        'notify-employee-on-status-updation', [{ roleKey: role.key }],
        context.organization.owner.key, ['push']
    )
}
