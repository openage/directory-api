'use strict'

exports.toModel = (entity) => {
    let model = {
        id: entity.id,
        code: entity.code,
        permissions: entity.permissions
    }

    if (entity.tenant) {
        model.tenant = entity.tenant._doc ? {
            id: entity.tenant.id
        } : {
            id: entity.tenant.toString()
        }
    }

    return model
}

exports.toSearchModel = (entities) => {
    return entities.map(entity => {
        return exports.toModel(entity)
    })
}
