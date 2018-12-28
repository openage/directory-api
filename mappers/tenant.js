'use strict'
const serviceProvider = require('config').get('providers')

const extractServices = (tenant) => {
    const services = []
    if (tenant.services && tenant.services.length) {
        tenant.services.forEach(service => {
            let configLevel = serviceProvider[service.code]
            if (!configLevel) { return }

            const model = {
                code: service.code,
                logo: service.logo || configLevel.logo,
                name: service.name || configLevel.name
            }

            model.apps = service.apps || configLevel.apps

            model.hooks = {}

            model.hooks.organization = service.hooks.organization || configLevel.hooks.organization
            model.hooks.employee = service.hooks.employee || configLevel.hooks.employee
            model.hooks.student = service.hooks.student || configLevel.hooks.student

            services.push(model)
        })
    }

    return services
}
exports.toModel = (entity) => {
    let model = {
        id: entity.id,
        code: entity.code,
        name: entity.name,
        key: entity.key,
        owner: {
            email: entity.owner.email
        }
    }

    model.services = extractServices(entity)

    return model
}
