'use strict'

exports.toModel = entity => {
    return {
        id: entity.id,
        name: entity.name,
        code: entity.code,
        status: entity.status,
        address: entity.address,
        organization: {
            id: entity.organization.id
        },
        timeZone: entity.timeZone
    }
}

exports.toSearchModel = entities => {
    return entities.map(entity => {
        return exports.toModel(entity)
    })
}
