'use strict'

const sendIt = require('@open-age/send-it-client')

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
            code: session.templateCode || 'session-initiated'
        },
        to: session.user,
        options: { skipInbox: true }
    }, context)
}
