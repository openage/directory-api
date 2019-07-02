'use strict'

const roleMapper = require('./role')

const serviceProvider = require('config').get('providers')

const extractServices = (organization) => {
    const serviceMapper = (service, level1, level2) => {
        level1 = level1 || {}
        level2 = level2 || {}
        const apps = service.apps || level1.apps || level2.apps || {}

        const serviceHooks = service.hooks || {}
        const level1Hooks = level1.hooks || {}
        const level2Hooks = level2.hooks || {}

        const mapHook = (name) => {
            const hook = serviceHooks[name] || level1Hooks[name] || level2Hooks[name] || {}

            if (!hook) { return null }
            return {
                onUpdate: hook.onUpdate,
                onCreate: hook.onCreate,
                onDelete: hook.onDelete
            }
        }

        return {
            code: service.code,
            logo: service.logo || level1.logo || level2.logo,
            name: service.name || level1.name || level2.name,
            url: service.url || level1.url || level2.url,
            apps: {
                web: apps.web,
                android: apps.android,
                iOS: apps.iOS
            },
            hooks: {
                organization: mapHook('organization'),
                employee: mapHook('employee'),
                student: mapHook('student')
            }
        }
    }

    const services = []
    if (organization.services && organization.services.length) {
        organization.services.forEach(service => {
            let configLevel = serviceProvider[service.code]
            if (!configLevel) { return }
            services.push(serviceMapper(service, configLevel))
        })
    }

    return services
}
exports.toModel = (entity, context) => {
    let model = {
        id: entity.id || entity._id.toString(),
        name: entity.name,
        code: entity.code,
        shortName: entity.shortName,
        type: entity.type,
        phone: entity.phone,
        email: entity.email,
        about: entity.about,
        location: entity.location,
        address: entity.address,
        meta: entity.meta,
        services: [],
        status: entity.status,
        lastEmployeeCode: entity.lastEmployeeCode || null,
        lastDivisionCode: entity.lastDivisionCode || null,
        lastDepartmentCode: entity.lastDepartmentCode || null,
        lastDesignationCode: entity.lastDesignationCode || null,
        lastContractorCode: entity.lastContractorCode || null
    }

    if (entity.logo) {
        model.logo = {
            url: entity.logo.url,
            thumbnail: entity.logo.thumbnail
        }
    }

    model.services = extractServices(entity)

    if (entity.owner) {
        model.owner = entity.owner._doc ? roleMapper.toModel(entity.owner, context) : {
            id: entity.owner.toString()
        }
    }

    if (entity.role) {
        model.role = entity.role._doc ? roleMapper.toModel(entity.role, context) : {
            id: entity.role.toString()
        }
    }

    return model
}

exports.toSummary = entity => {
    return {
        id: entity.id,
        code: entity.code,
        name: entity.name,
        logo: entity.logo,
        status: entity.status
    }
}

exports.toSearchModel = (entities, context) => {
    return entities.map((entity) => {
        return exports.toModel(entity, context)
    })
}
