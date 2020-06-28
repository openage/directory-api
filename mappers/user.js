'use strict'

// const serviceProvider = require('config').get('providers')
const profileMapper = require('./profile')
const roleTypeMapper = require('./role-type')
const organizationMapper = require('./organization')
const designationMapper = require('./designation')
const departmentMapper = require('./department')
const divisionMapper = require('./division')
const tenantMapper = require('./tenant')

// const extractServices = (organization, tenant) => {
//     if (!organization || !tenant) {
//         return []
//     }

//     const serviceMapper = (service, level1, level2) => {
//         level1 = level1 || {}
//         level2 = level2 || {}
//         let apps = service.apps || level1.apps || level2.apps || {}

//         return {
//             code: service.code,
//             logo: service.logo || level1.logo || level2.logo,
//             name: service.name || level1.name || level2.name,
//             url: service.url || level1.url || level2.url,
//             apps: {
//                 web: apps.web,
//                 android: apps.android,
//                 iOS: apps.iOS
//             }
//         }
//     }

//     const services = []
//     if (organization.services && organization.services.length) {
//         organization.services.forEach(service => {
//             let tenantLevel = tenant.services.find(item => item.code === service.code)
//             let configLevel = serviceProvider[service.code]
//             if (!tenantLevel || !configLevel) {
//                 return
//             }

//             const model = serviceMapper(service, tenantLevel, configLevel)
//             services.push(model)
//         })
//     } else if (tenant.services && tenant.services.length) {
//         tenant.services.forEach(service => {
//             let configLevel = serviceProvider[service.code]
//             if (!configLevel) {
//                 return
//             }
//             const model = serviceMapper(service, configLevel)
//             services.push(model)
//         })
//     }

//     return services
// }

const toRoleModel = (item, profile, context) => {
    let role = {
        id: item.id,
        key: item.key,
        code: item.code,
        meta: item.meta || {},
        profile: profileMapper.toModel(profile, context),
        permissions: [],
        dependents: [],
        type: roleTypeMapper.toModel(item.type, context),
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

    if (!(item.organization || item.employee || item.student)) {
        role.isDefaultRole = true
    }

    // if (item.dependents && item.dependents.length) {
    //     item.dependents.forEach(element => {
    //         let dependent = {
    //             role: {
    //                 id: element.role.id,
    //                 code: element.role.code,
    //                 key: element.role.key,
    //                 relation: element.relation,
    //                 permissions: [],
    //                 isDefaultRole: false
    //             },
    //             relation: element.relation
    //         }

    //         if (element.permissions) {
    //             element.role.permissions.forEach((permission) => {
    //                 dependent.role.permissions.push(permission)
    //             })
    //         }

    //         if (element.type) {
    //             if (element.role.type.permissions) {
    //                 element.role.type.permissions.forEach((permission) => {
    //                     dependent.role.permissions.push(permission)
    //                 })
    //             }
    //         }

    //         if (element.role.user) {
    //             dependent.role.user = element.role.user._doc ? {
    //                 id: element.role.user.id,
    //                 email: element.role.user.email,
    //                 phone: element.role.user.phone,
    //                 code: element.role.user.code,
    //                 relation: element.relation,
    //                 profile: profileMapper.toModel(element.role.user.profile, context),
    //                 identities: {},
    //                 picUrl: element.role.user.picUrl,
    //                 isProfileComplete: element.role.user.isProfileComplete
    //             } : {
    //                     id: element.role.user.toString()
    //                 }
    //         }
    //         role.dependents.push(dependent)
    //     })
    // }

    if (item.organization) {
        role.organization = organizationMapper.toModel(item.organization, context)
    }

    if (item.tenant) {
        role.tenant = tenantMapper.toModel(item.tenant, context)
    }

    if (item.employee) {
        role.profile = profileMapper.toModel(item.employee.profile || profile, context)
        let employee = {
            id: item.employee.id,
            code: item.employee.code,
            type: item.employee.type,
            phone: item.employee.phone,
            email: item.employee.email,
            profile: role.profile
        }

        if (item.employee.designation) {
            employee.designation = designationMapper.toModel(item.employee.designation, context)
        }

        if (item.employee.department) {
            employee.department = departmentMapper.toModel(item.employee.department, context)
        }

        if (item.employee.division) {
            employee.division = divisionMapper.toModel(item.employee.division, context)
        }

        role.employee = employee

        if (item.employee.isSupervisor) {
            role.permissions.push('organization.supervisor')
        }

        if (item.employee.isMentor) {
            role.permissions.push('organization.mentor')
        }
    }

    if (item.student) {
        role.profile = profileMapper.toModel(item.student.profile || profile, context)
        let student = {
            id: item.student.id,
            code: item.student.code,
            type: item.student.type,
            phone: item.student.phone,
            email: item.student.email,
            profile: role.profile
        }

        if (item.student.batch) {
            student.batch = designationMapper.toModel(item.student.batch, context)
        }

        if (item.student.course) {
            student.course = departmentMapper.toModel(item.student.course, context)
        }

        if (item.student.institute) {
            student.institute = divisionMapper.toModel(item.student.institute, context)
        }

        role.student = student
    }

    return role
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
    if (entity._bsontype === 'ObjectID') {
        return {
            id: entity.toString()
        }
    }
    let defaultProfile = profileMapper.toModel(entity.profile, context)
    let model = {
        id: entity.id,
        code: entity.code,
        email: entity.email,
        phone: entity.phone,
        status: entity.status,
        profile: defaultProfile,
        meta: entity.meta,
        identities: {},
        picUrl: entity.picUrl,
        isEmailValidate: entity.isEmailValidate,
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

    if (entity.address) {
        model.address = {
            line1: entity.address.line1,
            line2: entity.address.line2,
            city: entity.address.city,
            district: entity.address.district,
            state: entity.address.state,
            country: entity.address.country,
            pinCode: entity.address.pinCode,
            lat: entity.address.lat,
            long: entity.address.long
        }
    }

    let roles = []

    if (entity.roles && entity.roles.length !== 0) {
        entity.roles.forEach((item) => {
            let role = toRoleModel(item, entity.profile, context)
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
