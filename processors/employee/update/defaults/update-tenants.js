'use strict'
const hook = require('../../../../services/hooks')

exports.process = async (data, context) => {
    if (!data.id) {
        throw new Error('id is required')
    }

    return hook.employeeUpdate(data.id, context)
}
