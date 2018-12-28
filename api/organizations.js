'use strict'
const mapper = require('../mappers/organization')
const logger = require('@open-age/logger')('organization')
const organizationService = require('../services/organizations')
const db = require('../models')

exports.create = async (req, res) => {
    const log = req.context.logger.start('api:create')
    let organization = await organizationService.create(req.body, req.context)
    log.debug('organization created', organization)
    log.end()
    return mapper.toModel(organization)
}

exports.get = async (req) => {
    req.context.logger.start('get')

    let identifier = req.params.id === 'my' ? req.context.organization.id : req.params.id

    let organization = identifier.isObjectId()
        ? await await organizationService.getById(identifier, req.context)
        : await await organizationService.getByCode(identifier, req.context)

    if (!organization) { throw new Error('organization not exist') }
    return mapper.toModel(organization)
}

exports.search = async (req) => {
    let log = req.context.logger.start('api:organizations:search')

    let query = {}

    if (req.query.type) {
        query.type = req.query.type
    }

    return db.organization.find(query)
        .then(orgList => {
            log.end()
            return mapper.toSearchModel(orgList)
        })
}

exports.delete = (req, res) => {
    // to delete all the employees
    // to delete all its divisions
    // to delete all its departments
    // to delete all its teamMembers
    // to delete all its designation
    // to delete from AMS

}

exports.update = async (req, res) => {
    let model = req.body
    let orgId = req.params.id

    try {
        if (model.code) {
            let orgWithSameCode = await db.organization.findOne({
                $and: [{
                    $or: [{
                        code: model.code,
                    }, {
                        previousCode: model.code
                    }]
                }, {
                    _id: {
                        $ne: orgId
                    }
                }]
            })

            if (orgWithSameCode) {
                return res.failure(`organization with code ${model.code} already exist`)
            }
        }

        let organization = await organizationService.getById(orgId)

        if (organization.isCodeUpdated) {
            throw new Error('you can update code once')
        }

        let updatedOrganization = await organizationService.update(model, organization, req.context)

        return res.data(mapper.toModel(updatedOrganization))
    } catch (error) {
        logger.error(error)
        return res.failure(error)
    }
}

exports.codeAvailable = async (req) => {
    let organization = await organizationService.getByCode(req.body.code)

    let data = {}

    data.isAvailable = !organization // false if exist

    if (!data.isAvailable) {
        data.available = await organizationService.availableCodeFinder(req.body.code) // suggested available code
    }
    return data
}
