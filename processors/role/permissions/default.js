'use strict'

const communications = require('../../../../services/communications')
const db = require('../../../../models')

exports.process = async (data, context) => {
    const role = await db.role.findById(data.id).populate('employee')

    context.logger.info(`sending message to ${context.organization.owner.key}`)

    return communications.send({
        name: role.employee.name,
        id: role.id
    },
    'notify-admin-on-employee-creation', [{ roleKey: context.organization.owner.key }],
    role.key, ['push']
    ).then((communications) => {
        context.logger.info('push delivered')
    })
}
