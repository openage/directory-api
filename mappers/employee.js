'use strict'

const profileMapper = require('./profile')
const departmentMapper = require('./department')
const designationMapper = require('./designation')
const divisionMapper = require('./division')
const organizationMapper = require('./organization')
const imageMapper = require('./image')

exports.toModel = (entity, context) => {
    if (!entity) {
        return null
    }

    if (entity._bsontype === 'ObjectID') {
        return {
            id: entity.toString()
        }
    }
    var model = {
        id: entity.id,
        name: entity.name,
        code: entity.code,
        profile: profileMapper.toModel(entity.profile, context),
        status: entity.status,
        type: entity.type,
        email: entity.email,
        phone: entity.phone,
        config: entity.config,
        supervisor: toSummaryModel(entity.supervisor, context),
        designation: designationMapper.toSummary(entity.designation, context),
        department: departmentMapper.toSummary(entity.department, context),
        division: divisionMapper.toSummary(entity.division, context),
        organization: organizationMapper.toSummary(entity.organization, context),
        doj: entity.doj,
        dol: entity.dol,
        reason: entity.reason
    }

    if (entity.user && entity.user.lastSeen) {
        model.lastSeen = entity.user.lastSeen
    }

    if (entity.address) {
        model.address = entity.address.toObject()
    }

    // if (entity.organization.owner) {
    //     model.organization.owner = entity.organization.owner
    // }

    if (entity.role) {
        model.role = {
            id: entity.role.id,
            code: entity.role.code
        }

        if (context.role.id === entity.role.id) {
            model.role.key = entity.role.key
        }

        if (context.role.id === entity.role.id || context.hasPermission('organization.admin')) {
            model.role.permissions = entity.role.permissions || []
            if (entity.role.type) {
                if (entity.role.type._doc) {
                    entity.role.type.permissions.forEach(permission => {
                        model.role.permissions.push(permission)
                    })
                }
            }
            if (model.role.permissions.toObject) {
                model.role.permissions = model.role.permissions.toObject()
            }
        }

        return model
    }

    return model
}

const toSummaryModel = (entity, context) => {
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
        profile: {
            firstName: entity.profile.firstName,
            lastName: entity.profile.lastName,
            gender: entity.profile.gender,
            pic: imageMapper.toModel(entity.profile.pic, context)
        },
        code: entity.code,
        email: entity.email,
        phone: entity.phone,
        type: entity.type,
        supervisor: this.toSummary(entity.supervisor, context),
        designation: designationMapper.toSummary(entity.designation, context),
        department: departmentMapper.toSummary(entity.department, context),
        division: divisionMapper.toSummary(entity.division, context),
        status: entity.status
    }
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

    const model = toSummaryModel(entity, context)

    model.address = entity.address.toObject()
    model.meta = entity.meta

    return model
}

exports.toServiceModel = (entity, context) => {
    var model = this.toModel(entity, context)
    model.config = undefined
    model.trackingId = model.id // to detect it is coming from open-age
    model.id = undefined

    return model
}

exports.toFullModel = (entity, context) => {
    var model = {
        id: entity.id,
        name: entity.name,

        code: entity.code,
        status: entity.status,
        email: entity.email,
        phone: entity.phone,
        userType: entity.userType || 'normal',
        picUrl: entity.picUrl,
        picData: entity.picData
    }

    if (entity.status && entity.status.toLowerCase() === 'activate') {
        model.token = entity.token
    }

    if (entity.organization) {
        model.organization = {
            id: entity.organization.id,
            code: entity.organization.code,
            name: entity.organization.name
        }
    }
    return model
}

exports.toSearchModel = (entities, context) => {
    return entities.map(entity => {
        return exports.toModel(entity, context)
    })
}

exports.toShortModel = (entities, context) => {
    return entities.map(entity => {
        let model = {
            id: entity.id,
            name: entity.name,
            code: entity.code,
            email: entity.email,
            phone: entity.phone,
            status: entity.status,
            picUrl: entity.picUrl
        }

        if (entity.designation) {
            model.designation = entity.designation.name
        }
        return model
    })
}
