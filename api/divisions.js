'use strict'
const mapper = require('../mappers/division')
const division = require('../services/divisions')
const db = require('../models')

exports.create = async (req) => {
    let model = req.body
    let newDivision = await division.create(model, req.context)
    return mapper.toModel(newDivision, req.context)
}

exports.search = async (req) => {
    let divisions = await division.search(req.query, req.context)

    if (!divisions) {
        throw new Error('no divisions found')
    }
    return mapper.toSearchModel(divisions, req.context)
}

exports.delete = async (req) => {
    let division = await db.division.findOne({ '_id': (req.params.id).toObjectId() })

    if (!division) {
        throw new Error('division not found')
    }
    let entity = division
    entity.status = 'inactive'
    await entity.save()
    return 'division removed successfully'
}

exports.update = async (req) => {
    let model = req.body

    let entity = await db.division.findById(req.params.id)
    if (!entity) {
        throw new Error('division not found')
    }
    let updatedEntity = await division.update(model, entity, req.context)

    return mapper.toModel(updatedEntity, req.context)
}

exports.bulk = async (req) => {
    for (const item of req.body.items) {
        let entity
        if (item.code) {
            entity = await division.get({
                code: item.code
            }, req.context)
        }
        if (entity) {
            await division.update(item, entity, req.context)
        } else {
            await division.create(item, req.context)
        }
    }

    return `added/updated '${req.body.items.length}' item(s)`
}
