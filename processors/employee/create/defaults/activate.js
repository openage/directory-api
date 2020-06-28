'use strict'
const activator = require('../../active')

exports.process = async (entity, context) => {
    if (entity.status !== 'active') {
        return
    }

    await activator.process(entity, context)
}
