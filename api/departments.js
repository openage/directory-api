'use strict'
let mapper = require('../mappers/department')
const departments = require('../services/departments')
const logger = require('@open-age/logger')('departments')
const divisions = require('../services/divisions')

exports.create = async (req, res) => {
    let model = req.body
    let data = {
        code: model.code,
        name: model.name,
        division: model.division
    }

    try {
        let division = await divisions.getById(model.division, req.context)
        if (!division) {
            return res.failure('division not found')
        }

        let department = await departments.create(data, req.context)

        return res.data(mapper.toModel(department))
    } catch (error) {
        return res.failure(error)
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
        let items = await departments.search(where, req.context)

        return res.page(mapper.toSearchModel(items))
    } catch (error) {
        logger.error(error)
        return res.failure(error)
    }
}
