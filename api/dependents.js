'use strict'

const dependentService = require('../services/dependents')
const mapper = require('../mappers/dependent')

exports.create = async (req) => {
    let dependentUser = await dependentService.create(req.body, req.context)
    return mapper.toModel(dependentUser, req.context)
}

exports.bulk = async (req) => {
    let log = req.context.logger.start('api/dependents:bulk')
    let dependentList = []
    for (let index = 0; index < req.body.dependents.length; index++) {
        let userModel = req.body.dependents[index]
        await dependentService.create(userModel, req.context).then((dependent) => {
            dependentList.push(dependent)
        })
    }
    log.end()
    return mapper.toSearchModel(dependentList, req.context)
}
