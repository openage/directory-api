'use strict'
const mapper = require('../mappers/designation')
const designations = require('../services/designations')
const logger = require('@open-age/logger')('designations')
const db = require('../models')

exports.create = async (req, res) => {
    logger.start('create')
    let data = {
        code: req.body.code,
        name: req.body.name
    }
    try {
        let designationWithSameCode = await designations.get(data, req.context)
        if (designationWithSameCode) {
            throw new Error('designation code ' + data.code + ' is already exist')
        }
        let designation = await designations.create(req.body, req.context)

        return res.data(mapper.toModel(designation))
    } catch (error) {
        logger.error(error)
        return res.failure(error)
    }
}

exports.update = async (req, res) => {
    logger.start('update')
    let model = req.body

    let data = {
        code: model.code,
        name: model.name
    }

    try {
        let designationWithSameCode = await designations.get(data, req.context)
        if (designationWithSameCode) {
            return res.failure('designation code ' + data.code + ' is already exist')
        }

        let designation = await designations.getById(req.params.id)
        if (!designation) {
            return res.failure('designation not found')
        }
        let updatedDesignation = await designations.update(data, designation)
        return res.data(mapper.toModel(updatedDesignation))
    } catch (err) {
        return res.failure(err)
    }
}

exports.delete = async (req, res) => {
    logger.start('delete')
    try {
        let designation = await designations.getById(req.params.id)

        if (!designation) {
            throw new Error('designation not found')
        }
        await db.designation.remove(req.params.id)
        return res.data('designation deleted successfully')
    } catch (err) {
        logger.error(err)
        return res.failure(err)
    }
}

exports.search = async (req, res) => {
    logger.start('search')

    let where = {}
    if (req.query.name) {
        where['name'] = {
            '$regex': req.query.name
        }
    }

    try {
        let items = await designations.search(where, req.context)
        return res.page(mapper.toSearchModel(items))
    } catch (err) {
        res.failure(err)
    }
}

exports.get = async (req, res) => {
    logger.start('get')
    let designation = await designations.getById(req.params.id)

    if (!designation) {
        return res.failure('no designations found')
    }
    res.data(mapper.toModel(designation))
}
