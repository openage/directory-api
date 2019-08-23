'use strict'

const sendIt = require('@open-age/send-it-client')

exports.process = async (employee, context) => {
    await sendIt.dispatch({
        data: {
            id: employee.id,
            name: `${employee.profile.firstName}`,
            status: employee.status,
            organization: employee.organization || context.organization
        },
        template: {
            code: 'employee-joining'
        },
        to: { email: employee.email }
        // options: options
    }, context)
}
