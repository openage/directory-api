'use strict'

const imageMapper = require('./image')
const navMapper = require('./nav')
const hookMapper = require('./hook')

const roleMapper = (entity, context) => {
    if (!entity || entity._bsontype === 'ObjectID') {
        return null
    }

    let model = {
        id: entity.id
    }

    let isOwner = context.hasPermission('organization.owner') || (context.role && entity.id === context.role.id)

    if (isOwner || context.hasPermission(['tenant.admin', 'organization.admin'])) {
        model.code = entity.code
        model.email = entity.email
        model.phone = entity.phone
    }

    if (isOwner) {
        model.key = entity.key
    }

    return model
}

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
        meta: entity.meta || {},
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

    // if (entity.role) {
    //     model.role = entity.role._doc ? roleMapper.toModel(entity.role, context) : {
    //         id: entity.role.toString()
    //     }
    // }

    if (context.role && entity.owner && entity.owner.id === context.role.id) {
        model.isProfileCompleted = entity.isProfileCompleted
        model.lastEmployeeCode = entity.lastEmployeeCode || null
        model.lastDivisionCode = entity.lastDivisionCode || null
        model.lastDepartmentCode = entity.lastDepartmentCode || null
        model.lastDesignationCode = entity.lastDesignationCode || null
        model.lastContractorCode = entity.lastContractorCode || null
        model.config = entity.config
        model.hooks = hookMapper.toModel(entity.hooks, context)
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
        phone: entity.phone,
        email: entity.email,
        meta: entity.meta || {},
        address: entity.address ? entity.address.toObject() : null,
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
