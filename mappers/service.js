const serviceProvider = require('config').get('providers')

exports.toModel = (items, context) => {
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
    if (items && items.length) {
        items.forEach(service => {
            let configLevel = serviceProvider[service.code]
            if (!configLevel) { return }
            services.push(serviceMapper(service, configLevel))
        })
    }

    return services
}
