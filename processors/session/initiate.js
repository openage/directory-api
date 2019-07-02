'use strict'

const sendIt = require('@open-age/send-it-client')

exports.process = async (session, context) => {
    await sendIt.dispatch({
        data: {
            otp: session.otp,
            purpose: session.purpose,
            device: session.device,
            app: session.app,
            timeStamp: session.timeStamp
        },
        template: {
            code: 'session-initiated'
        },
        to: session.user,
        options: { skipInbox: true }
    }, context)
}
