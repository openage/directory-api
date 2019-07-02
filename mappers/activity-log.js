'use strict'

exports.toModel = (entity, context) => {
    let model = {
        id: entity.id,
        action: entity.action,
        status: entity.status,
        timeStamp: entity.timeStamp,
        upon: entity.upon,
        changes: []
    }

    if (entity.changes && entity.changes.length > 0) {
        model.changes = entity.changes.map((change) => {
            return {
                key: change.key,
                oldValue: change.oldValue,
                newValue: change.newValue
            }
        })
    }

    if (entity.role && entity.role._doc) {
        model.role = {
            id: entity.role.id
        }
    } else {
        model.role = {
            id: entity.role.toString()
        }
    }

    return model
}

exports.toSearchModel = (entities, context) => {
    return entities.map(entity => {
        return exports.toModel(entity, context)
    })
}
