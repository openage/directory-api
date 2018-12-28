'use strict'
const mapper = require('../mappers/division')
const division = require('../services/divisions')
const logger = require('@open-age/logger')('divisions')

exports.create = async (req, res) => {
    let model = req.body

    try {
        let newDivision = await division.create(model, req.context)

        return res.data(mapper.toModel(newDivision))
    } catch (err) {
        logger.error(err)
        res.failure(err)
    }
}

exports.search = async (req, res) => {
    logger.start('search')
    try {
        let divisions = await division.search(req.query, req.context)

        if (!divisions) {
            return res.failure('no divisions found')
        }
        res.page(mapper.toSearchModel(divisions))
    } catch (err) {
        res.failure(err)
    }
}
