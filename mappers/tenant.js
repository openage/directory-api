'use strict'

const navMapper = require('./nav')
const serviceMapper = require('./service')
const imageMapper = require('./image')

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

    if (context.user && entity.owner && entity.owner.id === context.role.id) {
        model.rebranding = !!entity.rebranding
        model.key = entity.key
        model.config = entity.config
    }
    return model
}
