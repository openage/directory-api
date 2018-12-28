'use strict'
const logger = require('@open-age/logger')('tenants')
const mapper = require('../mappers/tenant')
const tenants = require('../services/tenants')
const users = require('../services/users')

exports.create = async (req, res) => {
    logger.start('create')
    let model = {
        code: req.body.code,
        name: req.body.name
    }
    let tenant = await tenants.create(model)

    let context = {}
    context.tenant = tenant
    context.logger = logger
    await users.getOrCreate(req.body.owner, context)
    tenant.owner = context.role[0]
    tenant.save()
    return res.data(mapper.toModel(tenant))
}
