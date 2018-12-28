'use strict'

exports.toModel = entity => {
    return {
        id: entity.id,
        name: entity.name,
        code: entity.code,
        level: entity.level,
        organization: {
            id: entity.organization.id
        }
    }
}

exports.toSearchModel = entities => {
    return entities.map(entity => {
        return exports.toModel(entity)
    })
}
