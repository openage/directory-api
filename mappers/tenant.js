'use strict'

const navMapper = require('./nav')
const hookMapper = require('./hook')
const imageMapper = require('./image')

const roleMapper = (entity, context) => {
    if (!entity || entity._bsontype === 'ObjectID' || !context) {
        return null
    }

    if (context.hasPermission('tenant.admin')) {
        return {
            code: entity.code,
            email: entity.email,
            phone: entity.phone
        }
    }

    if (context.hasPermission('tenant.owner') || (context.role && entity.id === context.role.id)) {
        return {
            code: entity.code,
            email: entity.email,
            phone: entity.phone,
            key: entity.key
        }
    }
}

exports.toModel = (entity, context) => {
    let model = {
        id: entity.id,
        code: entity.code,
        name: entity.name,
        host: entity.host,
        meta: entity.meta,
        styles: entity.styles,
        logo: imageMapper.toModel(entity.logo, context),
        services: (entity.services || []).map(s => {
            return {
                code: s.code,
                name: s.name,
                url: s.url
            }
        }),
        navs: navMapper.toModel(entity.navs, context),
        owner: roleMapper(entity.owner, context),
        status: entity.status

    }

    model.social = (entity.social || []).map(s => {
        return {
            model: {
                code: s.model ? s.model.code : ''
            },
            config: s.config
        }
    })
    model.level = 'tenant'

    if (context.organization) {
        context.logger.debug(`adding organization: ${context.organization.code} specific sections`)

        if (entity.rebranding) {
            model.level = 'organization'
            if (context.organization.logo) {
                model.logo = imageMapper.toModel(context.organization.logo, context)
            }

            if (context.organization.name) {
                model.name = context.organization.name
            }

            if (context.organization.styles) {
                model.styles = context.organization.styles
            }

            if (context.organization.social && context.organization.social.length) {
                model.social = context.organization.social.map(s => {
                    return {
                        model: {
                            code: s.model ? s.model.code : ''
                        },
                        config: s.config
                    }
                })
            }
        }

        if (context.organization.navs && context.organization.navs.length) {
            model.navs = navMapper.toModel(context.organization.navs, context)
        }

        if (context.organization.services && context.organization.services.length) {
            model.services = context.organization.services.map(s => {
                return {
                    code: s.code,
                    name: s.name,
                    url: s.url
                }
            })
        }
    }

    if (context.role && entity.owner && entity.owner.id === context.role.id) {
        model.rebranding = !!entity.rebranding
        model.config = entity.config
        model.hooks = hookMapper.toModel(entity.hooks, context)
    }
    return model
}
