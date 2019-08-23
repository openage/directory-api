'use strict'

const serviceProvider = require('config').get('providers')

const set = (model, entity, context) => {
    if (model.name) {
        entity.name = model.name
    }

    if (model.description) {
        entity.description = model.description
    }

    if (model.logo) {
        entity.logo = model.logo
    }
    if (model.url) {
        entity.url = model.url
    }

    if (model.apps) {
        entity.apps = {
            web: model.apps.web,
            android: model.apps.android,
            iOS: model.apps.iOS
        }
    }

    entity.hooks = entity.hools || {}

    if (model.hooks) {
        if (model.hooks.organization) {
            entity.hooks.organization = {
                config: model.hooks.organization.config || {},
                onCreate: model.hooks.organization.onCreate,
                onUpdate: model.hooks.organization.onUpdate,
                onDelete: model.hooks.organization.onDelete
            }
        }
        if (model.hooks.employee) {
            entity.hooks.employee = {
                config: model.hooks.employee.config || {},
                onCreate: model.hooks.employee.onCreate,
                onUpdate: model.hooks.employee.onUpdate,
                onDelete: model.hooks.employee.onDelete
            }
        }
    }

    return entity
}

exports.create = async (data, context) => {
    let entity = await exports.get(data.code.toLowerCase(), context)

    if (!entity) {
        entity = newEntity({ code: data.code.toLowerCase() }, context)
    }
    set(data, entity, context)
    await saveEntity(context)
    return entity
}

exports.get = async (query, context) => {
    context.logger.silly('services/integrations:get')
    if (typeof query === 'string') {
        return extract(context).find(i => i.code.toLowerCase() === query.toLowerCase())
    } else if (query.code) {
        return extract(context).find(i => i.code.toLowerCase() === query.code.toLowerCase())
    }
    return null
}

exports.update = async (id, model, context) => {
    context.logger.silly('services/role-types:update')
    let entity = await exports.get(id, context)
    set(model, entity, context)
    await saveEntity(context)
}

exports.search = async (query, paging, context) => {
    return {
        items: extract(context)
    }
}

const newEntity = (model, context) => {
    if (context.organization) {
        context.organization.services.push(model)
    } else {
        context.organization.services.push(model)
    }

    return model
}

const saveEntity = async (context) => {
    if (context.organization) {
        await context.organization.save()
    } else {
        await context.tenant.save()
    }
}

const extract = (context) => {
    let tenant = context.tenant
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
                config: hook.config,
                onUpdate: hook.onUpdate,
                onCreate: hook.onCreate,
                onDelete: hook.onDelete
            }
        }

        return {
            code: service.code,
            logo: service.logo || level1.logo || level2.logo,
            description: service.description || level1.description || level2.description,
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
    if (tenant.services && tenant.services.length) {
        tenant.services.forEach(service => {
            let configLevel = serviceProvider[service.code]
            if (configLevel) {
                services.push(serviceMapper(service, configLevel))
            } else {
                services.push(service)
            }
        })
    }

    return services
}
