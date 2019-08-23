'use strict'

exports.toModel = (entity, context) => {
    var model = {
        id: entity.id,
        name: entity.name,
        code: entity.code,
        status: entity.status,
        type: entity.type,
        email: entity.email,
        phone: entity.phone,
        config: entity.config,
        doj: entity.doj,
        dol: entity.dol,
        reason: entity.reason
    }

    if (entity.profile) {
        model.profile = entity.profile.toObject()
    }

    if (entity.user && entity.user.lastSeen) {
        model.lastSeen = entity.user.lastSeen
    }

    if (entity.address) {
        model.address = entity.address.toObject()
    }

    if (entity.organization) {
        model.organization = {
            id: entity.organization.id,
            code: entity.organization.code,
            name: entity.organization.name,
            shortName: entity.organization.shortName,
            type: entity.organization.type,
            profile: entity.organization.profile
        }

        // if (entity.organization.owner) {
        //     model.organization.owner = entity.organization.owner
        // }
    }

    if (entity.supervisor) {
        model.supervisor = {
            id: entity.supervisor.id,
            name: entity.supervisor.name,
            code: entity.supervisor.code,
            email: entity.supervisor.email,
            status: entity.supervisor.status,
            profile: entity.supervisor.profile,
            address: entity.supervisor.address,
            phone: entity.supervisor.phone
        }
        if (entity.supervisor.designation) {
            model.supervisor.designation = entity.supervisor.designation._doc ? {
                id: entity.supervisor.designation.id,
                code: entity.supervisor.designation.code,
                name: entity.supervisor.designation.name
            } : {
                    id: entity.supervisor.designation.toString()
                }
        }
        if (entity.supervisor.division) {
            model.supervisor.division = entity.supervisor.division._doc ? {
                id: entity.supervisor.division.id,
                code: entity.supervisor.division.code,
                name: entity.supervisor.division.name
            } : {
                    id: entity.supervisor.division.toString()
                }
        }

        if (entity.supervisor.department) {
            model.supervisor.department = entity.supervisor.department._doc ? {
                id: entity.supervisor.department.id,
                code: entity.supervisor.department.code,
                name: entity.supervisor.department.name
            } : {
                    id: entity.supervisor.department.toString()
                }
        }
        if (entity.supervisor.organization) {
            model.supervisor.organization = entity.supervisor.organization._doc ? {
                id: entity.supervisor.organization.id,
                code: entity.supervisor.organization.name
            } : {
                    id: entity.supervisor.organization.toString()
                }
        }
    }

    if (entity.designation) {
        model.designation = entity.designation._doc ? {
            id: entity.designation.id,
            code: entity.designation.code,
            name: entity.designation.name
        } : {
                id: entity.designation.toString()
            }
    }

    if (entity.department) {
        model.department = entity.department._doc ? {
            id: entity.department.id,
            code: entity.department.code,
            name: entity.department.name
        } : {
                id: entity.department.toString()
            }
    }

    if (entity.division) {
        model.division = entity.division._doc ? {
            id: entity.division.id,
            code: entity.division.code,
            name: entity.division.name
        } : {
                id: entity.division.toString()
            }
    }

    if (entity.role) {
        model.role = {
            id: entity.role.id,
            key: entity.role.key,
            permissions: entity.role.permissions || []
        }

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

exports.modelForAMS = (entities, context) => {
    return entities.map(entity => {
        return exports.toModel(entity, context)
    })
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
