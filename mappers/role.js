'use strict'
const profile = require('./profile')

exports.toModel = (entity) => {
    let model = {
        id: entity.id || entity._id.toString(),
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

    if (entity.dependents.length) {
        entity.dependents.forEach(element => {

            let dependentRole = {
                id: element.role._doc ? element.role.id : element.role.toString(),
                code: element.role._doc ? element.role.code : undefined,
                key: element.role._doc ? element.role.key : undefined,
                relation: element.relation,
                permissions: [],
                isDefaultRole: false
            }

            if (element.permissions) {
                element.role.permissions.forEach((permission) => {
                    dependentRole.permissions.push(permission)
                })
            }

            if (element.type) {
                if (element.role.type.permissions) {
                    element.role.type.permissions.forEach((permission) => {
                        dependentRole.permissions.push(permission)
                    })
                }
            }

            if (element.role.user) {
                dependentRole.user = element.role.user._doc ? {
                    id: element.role.user.id,
                    email: element.role.user.email,
                    phone: element.role.user.phone,
                    relation: element.relation,
                    profile: profile.toModel(element.role.user.profile),
                    identities: {},
                    picUrl: element.role.user.picUrl,
                    isProfileComplete: element.role.user.isProfileComplete
                } : {
                        id: element.role.user.toString()
                    }
            }
            model.dependents.push(dependentRole)
        })
    }

    if (entity.organization) {
        model.organization = entity.organization._doc ? {
            id: entity.organization.id,
            name: entity.organization.name,
            code: entity.organization.code,
            shortName: entity.organization.shortName,
            type: entity.organization.type,
            address: entity.organization.address,
            status: entity.organization.status,
            owner: entity.organization.owner
        } : {
                id: entity.organization.toString()
            }
    }

    if (entity.employee) {
        model.employee = entity.employee._doc ? {
            id: entity.employee.id,
            code: entity.employee.code,
            type: entity.employee.type,
            address: entity.employee.address,
            status: entity.employee.status,
            profile: entity.employee.profile
        } : {
                id: entity.employee.toString()
            }
    }


    if (entity.employee && entity.employee.designation) {
        model.employee.designation = entity.employee.designation._doc ? {
            id: entity.employee.designation.id,
            name: entity.employee.designation.name,
            code: entity.employee.designation.code,
            level: entity.employee.designation.level
        } : {
                id: entity.employee.designation.toString()
            }
    }

    if (entity.employee && entity.employee.division) {
        model.employee.division = entity.employee.division._doc ? {
            id: entity.employee.division.id,
            name: entity.employee.division.name,
            code: entity.employee.division.code
        } : {
                id: entity.employee.division.toString()
            }
    }

    if (entity.student) {
        model.student = entity.student._doc ? {
            id: entity.student.id,
            name: entity.student.name,
            code: entity.student.code,
            address: entity.student.address,
            status: entity.student.status,
            profile: entity.student.profile
        } : {
                id: entity.student.toString()
            }
    }

    if (entity.user) {
        model.user = entity.user._doc ? {
            id: entity.user.id,
            email: entity.user.email,
            phone: entity.user.phone,
            picUrl: entity.user.picUrl,
            profile: entity.user.profile,
            identities: entity.user.identities
        } : {
                id: entity.user.toString()
            }
    }

    if (entity.tenant) {
        model.tenant = entity.tenant._doc ? {
            id: entity.tenant.id,
            name: entity.tenant.name,
            code: entity.tenant.code,
            key: entity.tenant.key
        } : {
                id: entity.tenant.toString()
            }
    }

    return model
}

exports.toSearchModel = entities => {
    return entities.map(entity => {
        return exports.toModel(entity)
    })
}
