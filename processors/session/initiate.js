'use strict'

const sendIt = require('@open-age/send-it-client')
// const roleService = require('../../services/role-getter')

exports.process = async (session, context) => {
    await sendIt.dispatch({
        data: {
            otp: session.otp,
            app: session.app,
            device: session.device,
            user: session.user,
            purpose: session.purpose,
            timeStamp: session.timeStamp
        },
        template: {
            code: `directory|session-${session.status}`
        },
        to: {
            role: session.user.roles[0]
        },
        options: { isHidden: true }
    }, {
        id: context.id,
        logger: context.logger,
        role: context.tenant && context.tenant.owner ? context.tenant.owner : context.role,
        session: session,
        organization: context.organization,
        tenant: context.tenant
    })
}
