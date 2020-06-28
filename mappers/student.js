'use strict'

const employeeMapper = require('./employee')
const profileMapper = require('./profile')

exports.toModel = (entity, context) => {
    if (entity._bsontype === 'ObjectID') {
        return {
            id: entity.toString()
        }
    }
    var model = {
        id: entity.id,
        code: entity.code,
        status: entity.status,
        email: entity.email,
        phone: entity.phone,
        config: entity.config,
        doj: entity.doj,
        dol: entity.dol,
        aadhar: entity.aadhar,
        prospectNo: entity.prospectNo
    }

    if (entity.profile) {
        model.profile = profileMapper.toModel(entity.profile, context)
    }

    if (entity.user && entity.user.lastSeen) {
        model.lastSeen = entity.user.lastSeen
    }

    if (entity.address) {
        model.address = entity.address.toObject()
    }

    if (entity.organization) {
        model.organization = entity.organization._doc
            ? {
                id: entity.organization.id,
                code: entity.organization.code,
                name: entity.organization.name,
                shortName: entity.organization.shortName,
                type: entity.organization.type
            } : {
                id: entity.organization.toString()
            }
    }
    if (entity.mentor) {
        model.mentor = employeeMapper.toSummary(entity.mentor, context)
    }

    if (entity.batch) {
        model.batch = entity.batch._doc
            ? {
                id: entity.batch.id,
                code: entity.batch.code,
                name: entity.batch.name
            } : {
                id: entity.batch.toString()
            }
    }

    if (entity.course) {
        model.course = entity.course._doc
            ? {
                id: entity.course.id,
                code: entity.course.code,
                name: entity.course.name
            } : {
                id: entity.course.toString()
            }
    }

    if (entity.institute) {
        model.institute = entity.institute._doc
            ? {
                id: entity.institute.id,
                code: entity.institute.code,
                name: entity.institute.name
            } : {
                id: entity.institute.toString()
            }
    }

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
    }
    return model
}

exports.toServiceModel = (entity, context) => {
    var model = this.toModel(entity, context)
    model.config = undefined
    model.trackingId = model.id // to detect it is coming from open-age
    model.id = undefined

    return model
}

exports.toSummary = (entity, context) => {
    let model = {
        id: entity.id,
        code: entity.code,
        email: entity.email,
        phone: entity.phone,
        status: entity.status,
        prospectNo: entity.prospectNo
    }

    if (entity.profile) {
        model.profile = profileMapper.toModel(entity.profile, context)
    }

    if (entity.batch) {
        model.batch = {
            name: entity.batch.name
        }
    }

    if (entity.course) {
        model.course = {
            name: entity.course.name
        }
    }

    if (entity.institute) {
        model.institute = {
            name: entity.institute.name
        }
    }
    return model
}
