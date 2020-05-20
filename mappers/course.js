'use strict'

const batchMapper = require('./batch')

exports.toModel = (entity, context) => {
    if (entity._bsontype === 'ObjectID') {
        return {
            id: entity.toString()
        }
    }

    let model = {
        id: entity.id,
        name: entity.name,
        code: entity.code,
        level: entity.level,
        status: entity.status

    }

    if (entity.batches) {
        model.batches = entity.batches.map(b => {
            return {
                batch: batchMapper.toModel(b.batch),
                lastRollNo: b.lastRollNo,
                status: b.status
            }
        })
    }

    return model
}

exports.toSearchModel = (entities, context) => {
    return entities.map(entity => {
        return exports.toModel(entity, context)
    })
}
