'use strict'

exports.toModel = (entity, context) => {
    let model = {
        id: entity.id,
        name: entity.name,
        description: entity.description,
        logo: entity.logo,
        url: entity.url,
        code: entity.code
    }

    if (entity.apps) {
        model.apps = {
            web: entity.apps.web,
            android: entity.apps.android,
            iOS: entity.apps.iOS
        }
    }

    model.hooks = {}

    if (entity.hooks) {
        if (entity.hooks.organization) {
            model.hooks.organization = {
                config: entity.hooks.organization.config,
                onCreate: entity.hooks.organization.onCreate,
                onUpdate: entity.hooks.organization.onUpdate,
                onDelete: entity.hooks.organization.onDelete
            }
        }
        if (entity.hooks.employee) {
            model.hooks.employee = {
                config: entity.hooks.employee.config,
                onCreate: entity.hooks.employee.onCreate,
                onUpdate: entity.hooks.employee.onUpdate,
                onDelete: entity.hooks.employee.onDelete
            }
        }
    }

    return model
}

exports.toSearchModel = (entities, context) => {
    return entities.map(entity => {
        return exports.toModel(entity, context)
    })
}
