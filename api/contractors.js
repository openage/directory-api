'use strict'
let mapper = require('../mappers/contractor')
const contractorService = require('../services/contractors')
const db = require('../models')

exports.get = async (req) => {
    let entity = await contractorService.get(req.params.id, req.context)

    if (!entity) {
        return 'contractor does not exist'
    }
    return mapper.toModel(entity, req.context)
}

exports.create = async (req) => {
    let entity = await contractorService.create(req.body, req.context)
    return mapper.toModel(entity, req.context)
}

exports.update = async (req) => {
    let model = req.body

    let entity = await db.contractor.findById(req.params.id)
    if (!entity) {
        throw new Error('contractor not found')
    }
    let updatedEntity = await contractorService.update(model, entity, req.context)

    return mapper.toModel(updatedEntity, req.context)
}

exports.delete = async (req) => {
    let contractor = await db.contractor.findOne({ '_id': (req.params.id).toObjectId() })

    if (!contractor) {
        throw new Error('contractor not found')
    }
    let entity = contractor
    entity.status = 'inactive'
    await entity.save()
    // TODO: move all the employees to default designation
    // await db.contractor.remove({ '_id': (req.params.id).toObjectId() })
    return 'contractor removed successfully'
}

exports.search = async (req) => {
    let items = await contractorService.search(req.query, req.context)
    return mapper.toSearchModel(items, req.context)
}

exports.bulk = async (req) => {
    for (const item of req.body.items) {
        let entity
        if (item.code) {
            entity = await contractorService.get({
                code: item.code
            }, req.context)
        }
        if (entity) {
            await contractorService.update(item, entity, req.context)
        } else {
            await contractorService.get(item, req.context)
        }
    }

    return `added/updated '${req.body.items.length}' item(s)`
}
