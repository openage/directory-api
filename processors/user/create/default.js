'use strict'

const communications = require('../../../services/communications')
const db = require('../../../models')

exports.process = async (data, context) => {
    const user = await db.user.findById(data.id)
    let to = {}
    let modes = []

    if (!user.phone) {
        to = { 'email': user.email }
        modes.push('email')
    } else {
        to = { 'phone': user.phone }
        modes.push('sms')
    }

    context.logger.debug(`sending message to ${to}`)
    return communications.send({ otp: user.otp },
        context.tenant.code + '-otp', [to],
        context.tenant.owner.key,
        modes, { isHidden: true }
    ).then(() => {
        context.logger.debug('otp delivered')
    })
}
