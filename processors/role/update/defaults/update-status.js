
const db = require('../../../../models')
const employeeService = require('../../../../services/employees')

exports.process = async (role, context) => {
    // if ((role.status === 'active') && role.employee && role.employee.status !== 'active') {
    //     if (role.employee.status !== 'active') {
    //         await employeeService.update({ status: 'active' }, role.employee, context)
    //     }
    // }
}
