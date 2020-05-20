'use strict'

exports.toModel = (entity, context) => {
    if (!entity) {
        return null
    }

    if (entity._bsontype === 'ObjectID') {
        return {
            id: entity.toString()
        }
    }

    return {
        id: entity.id,
        name: entity.name,
        code: entity.code,
        status: entity.status,
        level: entity.level
    }
}
exports.toSummary = (entity, context) => {
    if (!entity) {
        return null
    }
    if (entity._bsontype === 'ObjectID') {
        return {
            id: entity.toString()
        }
    }
    return {
        id: entity.id,
        code: entity.code,
        name: entity.name
    }
}

exports.toSearchModel = (entities, context) => {
    return entities.map(entity => {
        return exports.toModel(entity, context)
    })
}
