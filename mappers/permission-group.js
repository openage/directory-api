'use strict'

exports.toModel = (entity, context) => {
    if (!entity) {
        return
    }

    if (entity._bsontype === 'ObjectID') {
        return {
            id: entity.toString()
        }
    }
    return {
        id: entity.id,
        code: entity.code,
        name: entity.name,
        description: entity.description,
        permissions: (entity.permissions || []).map(p => {
            return {
                group: entity.name,
                code: p.code,
                name: p.name,
                description: p.description
            }
        }),
        status: entity.status
    }
}
