'use strict'

const sendIt = require('@open-age/send-it-client')

exports.process = async (organization, context) => {
    await sendIt.dispatch({
        data: {
            name: organization.name,
            shortName: organization.shortName,
            code: organization.code,
            type: organization.type,
            status: organization.status
        },
        template: {
            code: 'organization-activated'
        },
        to: organization.owner
        // options: options
    }, context)
}
