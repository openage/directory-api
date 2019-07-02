'use strict'

const sendIt = require('@open-age/send-it-client')

exports.process = async (role, context) => {
    // if (!role.employee) {
    //     return
    // }
    // await sendIt.dispatch({
    //     data: {
    //         name: `${role.employee.profile.firstName} ${role.employee.profile.lastName}`,
    //         id: role.id,
    //         employee: { type: role.employee.type },
    //         organization: { type: role.organization.type },
    //         permissions: role.permissions
    //     },
    //     template: {
    //         code: 'employee-created'
    //     },
    //     to: context.organization.owner
    //     // options: options
    // }, context)
}
