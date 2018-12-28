'use strict'

exports.toModel = entity => {
    return {
        id: entity.id,
        name: entity.name,
        code: entity.code
    }
}

exports.toSearchModel = entities => {
    return entities.map(entity => {
        return exports.toModel(entity)
    })
}
