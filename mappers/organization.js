'use strict'

const roleMapper = require('./role')

const serviceProvider = require('config').get('providers')

const extractServices = (organization) => {
    const services = []
    if (organization.services && organization.services.length) {
        organization.services.forEach(service => {
            let configLevel = serviceProvider[service.code]
            if (!configLevel) { return }

            const model = {
                code: service.code,
                logo: service.logo || configLevel.logo,
                name: service.name || configLevel.name
            }

            model.apps = service.apps || configLevel.apps

            services.push(model)
        })
    }

    return services
}
exports.toModel = entity => {
    let model = {
        id: entity.id || entity._id.toString(),
        name: entity.name,
        code: entity.code,
        shortName: entity.shortName,
        type: entity.type,
        location: entity.location,
        address: entity.address,
        services: [],
        status: entity.status,
        lastEmployeeCode: entity.lastEmployeeCode || null,
        lastDivisionCode: entity.lastDivisionCode || null,
        lastDepartmentCode: entity.lastDepartmentCode || null,
        lastDesignationCode: entity.lastDesignationCode || null
    }

    model.services = extractServices(entity)

    if (entity.owner) {
        model.owner = entity.owner._doc ? roleMapper.toModel(entity.owner) : {
            id: entity.owner.toString()
        }
    }

    if (entity.role) {
        model.role = entity.role._doc ? roleMapper.toModel(entity.role) : {
            id: entity.role.toString()
        }
    }

    return model
}

exports.toSearchModel = (entities) => {
    return entities.map((entity) => {
        return exports.toModel(entity)
    })
}
