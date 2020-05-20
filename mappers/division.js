'use strict'

const courses = require('./course')

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
        address: entity.address,
        timeZone: entity.timeZone,
        courses: (entity.courses && entity.courses.length) ? courses.toSearchModel(entity.courses) : []
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
        name: entity.name,
        courses: (entity.courses && entity.courses.length) ? courses.toSearchModel(entity.courses) : []
    }
}

exports.toSearchModel = (entities, context) => {
    return entities.map(entity => {
        return exports.toModel(entity, context)
    })
}
