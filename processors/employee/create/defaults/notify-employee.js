'use strict'

const sendIt = require('@open-age/send-it-client')

const employeeMapper = require('../../../../mappers/employee')

exports.process = async (employee, context) => {
    let model = employeeMapper.toModel(employee, context)

    await sendIt.dispatch({
        data: {
            employee: model
        },
        template: {
            code: `directory|employee-create-${employee.status}`
        },
        options: {
            to: { email: employee.email }
        }
    }, context)
}
