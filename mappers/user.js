'use strict'

const serviceProvider = require('config').get('providers')
const profile = require('./profile')

const extractServices = (organization, tenant) => {
    if (!organization || !tenant) {
        return []
    }

    const services = []
    if (organization.services && organization.services.length) {
        organization.services.forEach(service => {
            let tenantLevel = tenant.services.find(item => item.code === service.code)
            let configLevel = serviceProvider[service.code]
            if (!tenantLevel || !configLevel) {
                return
            }

            const model = {
                code: service.code,
                logo: service.logo || tenantLevel.logo || configLevel.logo,
                name: service.name || tenantLevel.name || configLevel.name
            }

            let apps = service.apps || tenantLevel.apps || configLevel.apps || {}

            model.apps = {
                web: apps.web,
                android: apps.android,
                iOS: apps.iOS
            }

            services.push(model)
        })
    } else {
        tenant.services.forEach(service => {
            let configLevel = serviceProvider[service.code]
            if (!configLevel) {
                return
            }
            const model = {
                code: service.code,
                logo: service.logo || configLevel.logo,
                name: service.name || configLevel.name
            }

            // model.apps = service.apps || configLevel.apps

            services.push(model)
        })
    }

    return services
}

exports.toModel = (entity) => {
    let model = {
        id: entity.id,
        email: entity.email,
        phone: entity.phone,
        profile: profile.toModel(entity.profile),
        identities: {},
        picUrl: entity.picUrl,
        isProfileComplete: entity.isProfileComplete,
        isTemporary: entity.isTemporary
    }

    if (entity.identities) {
        model.identities = {
            aadhaar: entity.identities.aadhaar,
            pan: entity.identities.pan,
            passport: entity.identities.passport
        }
    }

    let roles = []

    if (entity.roles && entity.roles.length !== 0) {
        entity.roles.forEach((item) => {
            let role = {
                id: item.id,
                key: item.key,
                code: item.code,
                permissions: [],
                dependents: [],
                isCodeUpdated: item.isCodeUpdated,
                timeStamp: item.timeStamp
            }

            if (!(item.organization || item.employee)) {
                role.isDefaultRole = true
                role.dependents.push({ // todo obsolete
                    id: item.id,
                    key: item.key,
                    code: item.code,
                    permissions: [],
                    user: {
                        phone: model.phone,
                        profile: model.profile
                    },
                    isDefaultRole: true,
                    isCodeUpdated: item.isCodeUpdated
                })
            }

            if (item.permissions) {
                item.permissions.forEach((permission) => {
                    role.permissions.push(permission)
                })
            }

            if (item.type) {
                if (item.type.permissions) {
                    item.type.permissions.forEach((permission) => {
                        role.permissions.push(permission)
                    })
                }
            }

            if (item.dependents && item.dependents.length) {
                item.dependents.forEach(element => {
                    let dependentRole = {
                        id: element.role.id,
                        code: element.role.code,
                        key: element.role.key,
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
                    role.dependents.push(dependentRole)
                })
            }

            if (item.organization) {
                let organization = {
                    id: item.organization.id,
                    name: item.organization.name,
                    code: item.organization.code,
                    shortName: item.organization.shortName,
                    type: item.organization.type,
                    address: item.organization.address,
                    services: []
                }

                if (item.tenant) {
                    organization.services = extractServices(item.organization, item.tenant)
                }
                role.organization = organization
            }

            if (item.employee) {
                let employee = {
                    id: item.employee.id,
                    code: item.employee.code,
                    profile: profile.toModel(item.employee.profile)
                }

                if (item.employee.designation) {
                    employee.designation = item.employee.designation._doc ? {
                        id: item.employee.designation.id,
                        name: item.employee.designation.name
                    } : {
                            id: item.employee.designation.toString()
                        }
                }

                if (item.employee.division) {
                    employee.division = item.employee.division._doc ? {
                        id: item.employee.division.id,
                        name: item.employee.division.name
                    } : {
                            id: item.employee.division.toString()
                        }
                }
                role.employee = employee
            }
            roles.push(role)
        })
        model.roles = roles
    }

    return model
}

exports.toSearchModel = entities => {
    return entities.map((entity) => {
        return exports.toModel(entity)
    })
}
