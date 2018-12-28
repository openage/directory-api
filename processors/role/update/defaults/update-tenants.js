'use strict'

const hookService = require('../../../../services/hooks')

exports.process = async (data, context) => {
    context.logger.start('processor:role:update')

    if (!data.id) {
        throw new Error('id is required')
    }

    return hookService.roleUpdate(data.id, context)
}
