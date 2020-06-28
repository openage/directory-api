'use strict'
const profileMapper = require('./profile')
const employeeMapper = require('./employee')
const roleTypeMapper = require('./role-type')
const studentMapper = require('./student')
const organizationMapper = require('./organization')

exports.toModel = (entity, context) => {
    if (entity._bsontype === 'ObjectID') {
        return {
            id: entity.toString()
        }
    }

    let isSelf = (entity.id === context.role.id)

    let model = {
        id: entity.id,
        level: entity.level,
        code: entity.code,
        meta: entity.meta || {},
        permissions: entity.permissions || [],
        dependents: [],
        isCodeUpdated: entity.isCodeUpdated
    }

    if (isSelf) { model.key = entity.key }

    if (entity.type) {
        if (entity.type.permissions) {
            entity.type.permissions.forEach(permission => {
                model.permissions.push(permission)
            })
        }
        model.type = roleTypeMapper.toModel(entity.type, context)
    }

    if (entity.user) {
        if (entity.user._bsontype === 'ObjectID') {
            model.user = {
                id: entity.user.toString()
            }
        } else {
            // TODO: don't send out the model.user
            model.user = {
                id: entity.user.id,
                email: entity.user.email,
                code: entity.user.code,
                phone: entity.user.phone,
                status: entity.user.status,
                picUrl: entity.user.picUrl,
                profile: profileMapper.toModel(entity.user.profile, context),
                identities: entity.user.identities,
                address: entity.user.address,
                meta: entity.user.meta
            }

            model.code = model.user.code
            model.email = model.user.email
            model.phone = model.user.phone
            model.profile = model.user.profile
        }
    } else {
        model.user = {}
    }

    if (entity.dependents.length) {
        model.dependents = entity.dependents.map(r => exports.toModel(r, context))
    }

    if (entity.employee) {
        model.employee = employeeMapper.toModel(entity.employee, context)
        model.code = model.code || model.employee.code
    }

    if (entity.student) {
        model.student = studentMapper.toModel(entity.student, context)
        model.code = model.code || model.student.code
    }

    if (entity.organization) {
        model.organization = organizationMapper.toModel(entity.organization, context)
    }

    if (entity.tenant) {
        if (entity.tenant._bsontype === 'ObjectID') {
            model.tenant = {
                id: entity.tenant.toString()
            }
        } else {
            model.tenant = {
                id: entity.tenant.id,
                name: entity.tenant.name,
                code: entity.tenant.code
            }

            if (entity.tenant.owner &&
                entity.tenant.owner._bsontype !== 'ObjectId' &&
                entity.tenant.owner.id === entity.id) {
                model.tenant.key = entity.tenant.key
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

exports.toSummaryModel = (entity, context) => {
    if (entity._bsontype === 'ObjectID') {
        return {
            id: entity.toString()
        }
    }

    let model = {
        id: entity.id,
        level: entity.level,
        code: entity.code
    }

    if (entity.user) {
        if (entity.user._bsontype === 'ObjectID') {
            model.user = {
                id: entity.user.toString()
            }
        } else {
            // TODO: don't send out the model.user
            model.user = {
                id: entity.user.id,
                status: entity.user.status,
                picUrl: entity.user.picUrl,
                identities: entity.user.identities,
                meta: entity.user.meta
            }

            model.email = entity.user.email
            model.phone = entity.user.phone
            model.profile = entity.user.profile
        }
    } else {
        model.user = {}
    }

    if (entity.type) {
        model.type = roleTypeMapper.toModel(entity.type, context)
    }

    if (entity.employee) {
        model.employee = employeeMapper.toModel(entity.employee, context)
    }

    if (entity.student) {
        model.student = studentMapper.toModel(entity.student, context)
    }

    return model
}

exports.toSummarySearchModel = (entities, context) => {
    return entities.map(entity => {
        return exports.toSummaryModel(entity, context)
    })
}
