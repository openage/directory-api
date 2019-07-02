'use strict'

const sendIt = require('@open-age/send-it-client')

exports.process = async (employee, context) => {
    await sendIt.dispatch({
        data: {
            id: employee.id,
            name: employee.name,
            status: employee.status
        },
        template: {
            code: 'employee-updated'
        },
        to: employee.user
        // options: options
    }, context)
}
