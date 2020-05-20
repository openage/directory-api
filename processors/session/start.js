
const sendIt = require('@open-age/send-it-client')
const roleService = require('../../services/role-getter')

exports.process = async (session, context) => {
    if (session.user && (!session.user.roles || !session.user.roles.length)) {
        session.user.roles = await roleService.search({
            user: session.user
        }, null, context)
    }

    await sendIt.dispatch({
        data: {
            otp: session.otp,
            purpose: session.purpose,
            device: session.device,
            app: session.app,
            timeStamp: session.timeStamp
        },
        template: {
            code: 'session-started'
        },
        to: {
            role: context.role
        },
        options: { skipInbox: true }
    }, {
        id: context.id,
        logger: context.logger,
        role: context.tenant && context.tenant.owner ? context.tenant.owner : context.role,
        session: session,
        organization: context.organization,
        tenant: context.tenant
    })
}
