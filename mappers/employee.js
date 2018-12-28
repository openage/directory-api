'use strict'

exports.toModel = entity => {
    var model = {
        id: entity.id,
        name: entity.name,
        code: entity.code,
        status: entity.status,
        type: entity.type,
        profile: entity.profile,
        address: entity.address,
        email: entity.email,
        phone: entity.phone
    }

    if (entity.organization) {
        model.organization = {
            id: entity.organization.id,
            code: entity.organization.code,
            name: entity.organization.name,
            shortName: entity.organization.shortName,
            type: entity.organization.type,
            profile: entity.organization.profile,
            owner: entity.organization.owner
        }
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
                name: entity.supervisor.designation.name
            } : {
                    id: entity.supervisor.designation.toString()
                }
        }
        if (entity.supervisor.division) {
            model.supervisor.division = entity.supervisor.division._doc ? {
                id: entity.supervisor.division.id,
                name: entity.supervisor.division.name
            } : {
                    id: entity.supervisor.division.toString()
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
            name: entity.designation.name
        } : {
                id: entity.designation.toString()
            }
    }

    if (entity.department) {
        model.department = entity.department._doc ? {
            id: entity.department.id,
            name: entity.department.name
        } : {
                id: entity.department.toString()
            }
    }

    if (entity.division) {
        model.division = entity.division._doc ? {
            id: entity.division.id,
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
    }
    return model
}

exports.modelForAMS = entities => {
    return entities.map(entity => {
        return exports.toModel(entity)
    })
}

exports.toFullModel = entity => {
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

exports.toSearchModel = entities => {
    return entities.map(entity => {
        return exports.toModel(entity)
    })
}

exports.toShortModel = entities => {
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
