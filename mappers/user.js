'use strict'

const serviceProvider = require('config').get('providers')
const profileMapper = require('./profile')

const extractServices = (organization, tenant) => {
    if (!organization || !tenant) {
        return []
    }

    const serviceMapper = (service, level1, level2) => {
        level1 = level1 || {}
        level2 = level2 || {}
        let apps = service.apps || level1.apps || level2.apps || {}

        return {
            code: service.code,
            logo: service.logo || level1.logo || level2.logo,
            name: service.name || level1.name || level2.name,
            url: service.url || level1.url || level2.url,
            apps: {
                web: apps.web,
                android: apps.android,
                iOS: apps.iOS
            }
        }
    }

    const services = []
    if (organization.services && organization.services.length) {
        organization.services.forEach(service => {
            let tenantLevel = tenant.services.find(item => item.code === service.code)
            let configLevel = serviceProvider[service.code]
            if (!tenantLevel || !configLevel) {
                return
            }

            const model = serviceMapper(service, tenantLevel, configLevel)
            services.push(model)
        })
    } else if (tenant.services && tenant.services.length) {
        tenant.services.forEach(service => {
            let configLevel = serviceProvider[service.code]
            if (!configLevel) {
                return
            }
            const model = serviceMapper(service, configLevel)
            services.push(model)
        })
    }

    return services
}

exports.toSessionModel = (entity) => {
    let model = {
        id: entity.id
    }

    if (entity.session) {
        model.session = {
            id: entity.session.id,
            timeStamp: entity.session.timeStamp,
            status: entity.session.status
        }
    }

    return model
}

exports.toModel = (entity, context) => {
    let defaultProfile = profileMapper.toModel(entity.profile, context)
    let model = {
        id: entity.id,
        code: entity.code,
        email: entity.email,
        phone: entity.phone,
        status: entity.status,
        profile: defaultProfile,
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
                profile: profileMapper.toModel(entity.profile, context),
                permissions: [],
                dependents: [],
                isCodeUpdated: item.isCodeUpdated,
                timeStamp: item.timeStamp
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

            if (!(item.organization || item.employee)) {
                role.isDefaultRole = true
                role.dependents.push({ // todo obsolete
                    role: {
                        id: item.id,
                        key: item.key,
                        code: item.code,
                        permissions: role.permissions,
                        user: {
                            phone: model.phone,
                            profile: profileMapper.toModel(model.profile, context)
                        },
                        isDefaultRole: true,
                        isCodeUpdated: item.isCodeUpdated
                    },
                    relation: 'me'
                })
            }

            if (item.dependents && item.dependents.length) {
                item.dependents.forEach(element => {
                    let dependent = {
                        role: {
                            id: element.role.id,
                            code: element.role.code,
                            key: element.role.key,
                            relation: element.relation,
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

                    if (element.type) {
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
                            code: element.role.user.code,
                            relation: element.relation,
                            profile: profileMapper.toModel(element.role.user.profile, context),
                            identities: {},
                            picUrl: element.role.user.picUrl,
                            isProfileComplete: element.role.user.isProfileComplete
                        } : {
                                id: element.role.user.toString()
                            }
                    }
                    role.dependents.push(dependent)
                })
            }

            if (item.organization) {
                let organization = {
                    id: item.organization.id,
                    name: item.organization.name,
                    code: item.organization.code,
                    shortName: item.organization.shortName,
                    type: item.organization.type,
                    logo: item.organization.logo,
                    meta: item.organization.meta,
                    isProfileCompleted: item.organization.isProfileCompleted,
                    address: {},
                    services: []
                }

                if (item.organization.address) {
                    organization.address = {
                        line1: item.organization.address.line1,
                        line2: item.organization.address.line2,
                        district: item.organization.address.district,
                        city: item.organization.address.city,
                        state: item.organization.address.state,
                        pinCode: item.organization.address.pinCode,
                        country: item.organization.address.country
                    }
                }

                if (item.tenant) {
                    organization.services = extractServices(item.organization, item.tenant)
                }
                role.organization = organization
            }

            if (item.employee) {
                role.profile = item.employee.profile
                    ? profileMapper.toModel(item.employee.profile, context) : defaultProfile
                let employee = {
                    id: item.employee.id,
                    code: item.employee.code,
                    type: item.employee.type,
                    phone: item.employee.phone,
                    email: item.employee.email,
                    profile: role.profile
                }

                if (item.employee.designation) {
                    employee.designation = item.employee.designation._doc ? {
                        id: item.employee.designation.id,
                        name: item.employee.designation.name
                    } : {
                            id: item.employee.designation.toString()
                        }
                }

                if (item.employee.department) {
                    employee.department = item.employee.department._doc ? {
                        id: item.employee.department.id,
                        name: item.employee.department.name
                    } : {
                            id: item.employee.department.toString()
                        }
                }

                if (item.employee.division) {
                    employee.division = item.employee.division._doc ? {
                        id: item.employee.division.id,
                        name: item.employee.division.name,
                        code: item.employee.division.code,
                        status: item.employee.division.status
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

exports.toSearchModel = (entities, context) => {
    return entities.map((entity) => {
        return exports.toModel(entity, context)
    })
}
