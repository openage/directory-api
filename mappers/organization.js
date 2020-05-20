'use strict'

const imageMapper = require('./image')
const navMapper = require('./nav')
const serviceMapper = require('./service')

exports.toModel = (entity, context) => {
    if (!entity) {
        return null
    }
    if (entity._bsontype === 'ObjectID') {
        return {
            id: entity.toString()
        }
    }

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

    // if (entity.owner) {
    //     model.owner = entity.owner._doc ? roleMapper.toModel(entity.owner, context) : {
    //         id: entity.owner.toString()
    //     }
    // }

    // if (entity.role) {
    //     model.role = entity.role._doc ? roleMapper.toModel(entity.role, context) : {
    //         id: entity.role.toString()
    //     }
    // }

    if (context.user && entity.owner && entity.owner.id === context.role.id) {
        model.isProfileCompleted = entity.isProfileCompleted
        model.lastEmployeeCode = entity.lastEmployeeCode || null
        model.lastDivisionCode = entity.lastDivisionCode || null
        model.lastDepartmentCode = entity.lastDepartmentCode || null
        model.lastDesignationCode = entity.lastDesignationCode || null
        model.lastContractorCode = entity.lastContractorCode || null
        model.key = entity.key
        model.config = entity.config
    }

    return model
}

exports.toSummary = (entity, context) => {
    if (!entity) {
        return null
    }
    if (entity._bsontype === 'ObjectID') {
        return {
            id: entity.toString()
        }
    }
    return {
        id: entity.id,
        code: entity.code,
        name: entity.name,
        type: entity.type,
        logo: imageMapper.toModel(entity.logo, context),
        status: entity.status,
        isProfileCompleted: entity.isProfileCompleted
    }
}

exports.toSearchModel = (entities, context) => {
    return entities.map((entity) => {
        return exports.toModel(entity, context)
    })
}
