'use strict'

exports.toModel = (entity, context) => {
    return {
        id: entity.id,
        name: entity.name,
        code: entity.code,
        status: entity.status,
        level: entity.level
        // organization: {
        //     id: entity.organization.id
        // }
    }
}

exports.toSearchModel = (entities, context) => {
    return entities.map(entity => {
        return exports.toModel(entity, context)
    })
}
