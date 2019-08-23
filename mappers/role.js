'use strict'
const profile = require('./profile')

exports.toModel = (entity, context) => {
    if (entity._bsontype === 'ObjectId') {
        return {
            id: entity.toString()
        }
    }

    let model = {
        id: entity.id,
        level: entity.level,
        key: entity.key,
        code: entity.code,
        permissions: entity.permissions || [],
        dependents: [],
        isCodeUpdated: entity.isCodeUpdated
    }

    if (entity.type) {
        if (entity.type.permissions) {
            entity.type.permissions.forEach(permission => {
                model.permissions.push(permission)
            })
        }
    }

    if (entity.user) {
        if (entity.user._bsontype === 'ObjectId') {
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
                profile: profile.toModel(entity.user.profile, context),
                identities: entity.user.identities
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
        entity.dependents.forEach(element => {
            let dependent = {
                role: {
                    id: element.role._doc ? element.role.id : element.role.toString(),
                    code: element.role._doc ? element.role.code : undefined,
                    key: element.role._doc ? element.role.key : undefined,
                    permissions: [],
                    isDefaultRole: false
                },
                relation: element.relation
            }

            if (element.permissions) {
                element.role.permissions.forEach((permission) => {
                    dependent.role.permissions.push(permission)
                })
            }

            if (element.role.type) {
                if (element.role.type.permissions) {
                    element.role.type.permissions.forEach((permission) => {
                        dependent.role.permissions.push(permission)
                    })
                }
            }

            if (element.role.user) {
                dependent.role.user = element.role.user._doc ? {
                    id: element.role.user.id,
                    email: element.role.user.email,
                    phone: element.role.user.phone,
                    profile: profile.toModel(element.role.user.profile, context),
                    identities: {},
                    picUrl: element.role.user.picUrl,
                    isProfileComplete: element.role.user.isProfileComplete,
                    isPhoneValidate: element.role.user.isPhoneValidate,
                    isEmailValidate: element.role.user.isEmailValidate
                } : {
                        id: element.role.user.toString()
                    }
            }
            model.dependents.push(dependent)
        })
    }

    if (entity.employee) {
        if (entity.employee._bsontype === 'ObjectId') {
            model.employee = {
                id: entity.employee.toString()
            }
        } else {
            // TODO: don't send out the model.employee
            model.employee = {
                id: entity.employee.id,
                code: entity.employee.code,
                type: entity.employee.type,
                phone: entity.employee.phone,
                email: entity.employee.email,
                address: entity.employee.address,
                status: entity.employee.status,
                profile: entity.employee.profile
            }
            model.code = model.employee.code
            model.email = model.employee.email || model.email
            model.phone = model.employee.phone || model.phone
            model.profile = profile.toModel(model.employee.profile, context) || model.profile
            model.address = model.employee.address || model.address
            model.status = model.employee.status
        }

        if (entity.employee.designation) {
            model.employee.designation = entity.employee.designation._doc ? {
                id: entity.employee.designation.id,
                name: entity.employee.designation.name,
                code: entity.employee.designation.code,
                level: entity.employee.designation.level
            } : {
                    id: entity.employee.designation.toString()
                }
        }

        if (entity.employee.division) {
            model.employee.division = entity.employee.division._doc ? {
                id: entity.employee.division.id,
                name: entity.employee.division.name,
                code: entity.employee.division.code
            } : {
                    id: entity.employee.division.toString()
                }
        }
    }

    if (entity.organization) {
        model.organization = entity.organization._doc ? {
            id: entity.organization.id,
            name: entity.organization.name,
            code: entity.organization.code,
            shortName: entity.organization.shortName,
            type: entity.organization.type,
            logo: entity.organization.logo,
            email: entity.organization.email,
            phone: entity.organization.phone,
            about: entity.organization.about,
            address: entity.organization.address,
            status: entity.organization.status,
            meta: entity.organization.meta,
            isProfileCompleted: entity.organization.isProfileCompleted
            // owner: entity.organization.owner
        } : {
                id: entity.organization.toString()
            }
    }

    if (entity.tenant) {
        if (entity.tenant._bsontype === 'ObjectId') {
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
