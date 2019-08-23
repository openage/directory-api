'use strict'
const serviceProvider = require('config').get('providers')

const extractServices = (tenant) => {
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
    if (tenant.services && tenant.services.length) {
        tenant.services.forEach(service => {
            let configLevel = serviceProvider[service.code]
            if (!configLevel) { return }
            services.push(serviceMapper(service, configLevel))
        })
    }

    return services
}
exports.toModel = (entity, context) => {
    let model = {
        id: entity.id,
        code: entity.code,
        name: entity.name,
        host: entity.host,
        key: entity.key
    }

    // if (entity.owner && entity.owner.user) {
    //     model.owner = {
    //         id: entity.owner.user.id
    //     }
    // }

    if (entity.logo) {
        model.logo = {
            url: entity.logo.url,
            thumbnail: entity.logo.thumbnail
        }
    }

    if (entity.navs && entity.navs.length) {
        model.navs = entity.navs.map(n => {
            var item = {
                title: n.title,
                icon: n.icon,
                items: []
            }

            if (n.items && n.items.length) {
                item.items = n.items.map(l => {
                    return {
                        name: l.name,
                        url: l.url,
                        icon: l.icon,
                        title: l.title,
                        routerLink: l.routerLink,
                        permissions: l.permissions
                    }
                })
            }
            return item
        })
    }
    model.services = extractServices(entity)

    return model
}
