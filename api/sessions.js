'use strict'
const sessionService = require('../services/sessions')
const mapper = require('../mappers/session')

exports.create = async (req) => {
    let session = await sessionService.initiate(req.body, req.context)
    return mapper.toModel(session, req.context)
}

exports.update = async (req) => {
    return sessionService.update(req.params.id, req.body, req.context).then((session) => {
        return 'session successfully active'
    })
}

exports.get = async (req) => {
    let session = await sessionService.get(req.params.id, req.context)
    return mapper.toModel(session, req.context)
}
