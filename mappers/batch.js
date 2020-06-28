'use strict'

exports.toModel = (entity, context) => {
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
        year: entity.year
    }
}
