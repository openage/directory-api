'use strict'
const mapper = require('../mappers/designation')
const designationService = require('../services/designations')
const db = require('../models')

exports.get = async (req) => {
    let entity = await designationService.get(req.params.id, req.context)

    if (!entity) {
        return 'designation does not exist'
    }
    return mapper.toModel(entity, req.context)
}

exports.create = async (req, res) => {
    let entity = await designationService.create(req.body, req.context)
    return mapper.toModel(entity, req.context)
}

exports.update = async (req) => {
    let model = req.body

    let entity = await db.designation.findById(req.params.id)
    if (!entity) {
        throw new Error('designation not found')
    }
    let updatedEntity = await designationService.update(model, entity, req.context)

    return mapper.toModel(updatedEntity, req.context)
}

exports.delete = async (req) => {
    let designation = await db.designation.findOne({ '_id': (req.params.id).toObjectId() })

    if (!designation) {
        throw new Error('designation not found')
    }
    let entity = designation
    entity.status = 'inactive'
    await entity.save()
    // TODO: move all the employees to default designation
    // await db.designation.remove(req.params.id)
    return 'designation removed successfully'
}

exports.search = async (req) => {
    let items = await designationService.search(req.query, req.context)
    return mapper.toSearchModel(items, req.context)
}

exports.bulk = async (req) => {
    for (const item of req.body.items) {
        let entity
        if (item.code) {
            entity = await designationService.get({
                code: item.code
            }, req.context)
        }
        if (entity) {
            await designationService.update(item, entity, req.context)
        } else {
            await designationService.get(item, req.context)
        }
    }
    return `added/updated '${req.body.items.length}' item(s)`
}
