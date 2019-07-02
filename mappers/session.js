'use strict'

const user = require('./user')

exports.toModel = (entity, context) => {
    const model = {
        id: entity.id,
        purpose: entity.purpose,
        device: entity.device,
        status: entity.status,
        app: entity.app,
        timeStamp: entity.timeStamp,
        user: entity.user ? user.toModel(entity.user, context) : undefined
    }
    return model
}

exports.toSearchModel = (entities, context) => {
    return entities.map((entity) => {
        return exports.toModel(entity, context)
    })
}
