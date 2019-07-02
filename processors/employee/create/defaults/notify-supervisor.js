'use strict'

const sendIt = require('@open-age/send-it-client')

exports.process = async (employee, context) => {
    let message = {
        data: {
            id: employee.id,
            name: employee.name
        },
        template: {
            code: 'employee-added'
        },
        to: employee.supervisor || context.organization.owner
        // options: options
    }

    await sendIt.dispatch(message, context)
}
