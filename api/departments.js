'use strict'
let mapper = require('../mappers/department')
const departmentService = require('../services/departments')
const db = require('../models')

exports.get = async (req) => {
    let entity = await departmentService.get(req.params.id, req.context)

    if (!entity) {
        return 'department does not exist'
    }
    return mapper.toModel(entity, req.context)
}

exports.create = async (req) => {
    let entity = await departmentService.create(req.body, req.context)
    return mapper.toModel(entity, req.context)
}

exports.update = async (req) => {
    let model = req.body

    let entity = await db.department.findById(req.params.id)
    if (!entity) {
        throw new Error('department not found')
    }
    let updatedEntity = await departmentService.update(model, entity, req.context)

    return mapper.toModel(updatedEntity, req.context)
}

exports.search = async (req) => {
    let items = await departmentService.search(req.query, req.context)
    return mapper.toSearchModel(items, req.context)
}

exports.delete = async (req) => {
    let department = await db.department.findOne({ '_id': (req.params.id).toObjectId() })

    if (!department) {
        throw new Error('department not found')
    }
    let entity = department
    entity.status = 'inactive'
    await entity.save()
    // TODO: move all the employees to default designation
    // await db.department.remove({ '_id': (req.params.id).toObjectId() })
    return 'department removed successfully'
}
exports.bulk = async (req) => {
    for (const item of req.body.items) {
        let entity
        if (item.code) {
            entity = await departmentService.get({
                code: item.code
            }, req.context)
        }
        if (entity) {
            await departmentService.update(item, entity, req.context)
        } else {
            await departmentService.get(item, req.context)
        }
    }

    return `added/updated '${req.body.items.length}' item(s)`
}
