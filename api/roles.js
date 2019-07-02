'use strict'

const mapper = require('../mappers/role')
const roleService = require('../services/roles')
// const employeeService = require('../services/employees')
// const organizationService = require('../services/organizations')
const dependentService = require('../services/dependents')

const paging = require('../helpers/paging')

exports.get = async (req) => {
    let role = await roleService.get(req.params.id, req.context)
    if (!role) {
        throw new Error(`ID_INVALID`)
    }

    return mapper.toModel(role, req.context)
}

exports.search = async (req) => {
    let rolesList = await roleService.search(req.query, paging.extract(req), req.context)
    return mapper.toSearchModel(rolesList, req.context)
}

exports.create = async (req) => {
    req.body.user = req.context.user
    let role = await roleService.create(req.body, req.context)
    return mapper.toModel(role, req.context)

    // const user = req.context.user

    // let employeeModel = req.body.employee || {}
    // employeeModel.user = user
    // employeeModel.phone = employeeModel.phone || user.phone
    // employeeModel.email = employeeModel.email || user.email
    // employeeModel.status = 'new'
    // // employeeModel.type = employeeModel.type

    // let profileModel = employeeModel.profile || {}
    // profileModel.firstName = profileModel.firstName || user.profile.firstName
    // profileModel.lastName = profileModel.lastName || user.profile.lastName
    // profileModel.gender = profileModel.gender || user.profile.gender
    // profileModel.dob = profileModel.dob || user.profile.dob

    // let picModel = profileModel.pic || user.profile.pic
    // picModel.url = picModel.url || user.profile.pic.url || user.picUrl
    // picModel.thumbnail = picModel.thumbnail || user.profile.pic.thumbnail

    // profileModel.pic = picModel
    // employeeModel.profile = profileModel
    // let organizationModel = req.body.organization

    // let organization
    // let role

    // if (organizationModel.id) {
    //     organization = await organizationService.getById(organizationModel.id, req.context)
    // } else {
    //     organization = await organizationService.getByCode(organizationModel.code, req.context)
    // }

    // if (organization) {
    //     req.context.logger.debug(`joining existing organization`)
    //     req.context.organization = organization

    //     employeeModel.role = {
    //         type: `${organization.type || 'organization'}.${employeeModel.type || 'employee'}`,
    //         status: 'inactive'
    //     }
    //     if (req.context.tenant.code === 'aqua') {
    //         employeeModel.type = 'normal'
    //         employeeModel.role = {
    //             type: `organization.normal`,
    //             status: 'inactive'
    //         }
    //     }

    //     let employee = await employeeService.getOrCreate(employeeModel, req.context)

    //     if (!employee) {
    //         throw new Error(`employee not found`)
    //     }

    //     role = await roleService.get({
    //         employee: employee,
    //         user: user,
    //         organization: organization
    //     }, req.context)
    // } else {
    //     req.context.logger.debug(`creating new organization`)

    //     organizationModel.status = 'active'
    //     employeeModel.code = 'default'
    //     employeeModel.status = 'active'
    //     employeeModel.type = 'superadmin'
    //     employeeModel.role = {
    //         type: `organization.superadmin`,
    //         status: 'active'
    //     }

    //     organizationModel.employee = employeeModel
    //     organization = await organizationService.create(organizationModel, req.context)

    //     role = organization.owner
    //     req.context.organization = organization
    //     // throw new Error('organization does not exist')
    // }

    // if (!role) {
    //     throw new Error('role not found')
    // }

    // role = await roleService.addExtraPermission(employeeModel.role.type, role, req.context)

    // return mapper.toModel(role, req.context)

    // let role = await roleService.get({       // todo changes for student
    //     code: req.body.code,
    //     organization: req.context.organization
    // }, req.context)

    // if (role) {
    //     throw new Error(`role code ${req.body.code} already exist`)
    // }

    // let user = await userService.getOrCreate({
    //     phone: req.body.phone,
    //     email: req.body.email,
    //     profile: req.body.profile
    // }, req.context)

    // type = await roleTypes.get(req.body.type, req.context)

    // role = await roleService.getOrCreate({
    //     code: req.body.code,
    //     phone: req.body.phone,
    //     email: req.body.email,
    //     profile: req.body.profile,
    //     location: req.body.location,
    //     address: req.body.address,
    //     organization: req.context.organization,
    //     status: req.body.status,
    //     user: user,
    //     type: type
    // }, req.context)
    // /* add permission to role end */

    // // todo  student in organization
    // // todo employee roleType

    // role.key = undefined
    // return mapper.toModel(role, req.context)
}

exports.update = async (req) => {
    let role = await roleService.update(req.params.id, req.body, req.context)
    return mapper.toModel(role, req.context)
}

exports.codeAvailable = async (req) => {
    let role = await roleService.getByCode(req.body.code, req.context)

    return {
        isAvailable: !role
    }
}

exports.createDependent = async (req) => {
    let log = req.context.logger.start('api/dependents:createDependent')

    const id = req.params.id !== 'my' ? req.params.id : req.context.role.id

    await dependentService.create(req.body, id, req.context)

    let headRoleWithDependent = await roleService.getWithDependent(id, req.context)

    log.end()
    return mapper.toModel(headRoleWithDependent, req.context)
}

exports.createDependentsInBulk = async (req) => {
    let log = req.context.logger.start('api/dependents:bulk')

    const id = req.params.id !== 'my' ? req.params.id : req.context.role.id

    const dependents = req.body.dependents || req.body.items

    for (let index = 0; index < dependents.length; index++) {
        let dependentModel = dependents[index]
        await dependentService.create(dependentModel, id, req.context)
    }

    let headRoleWithDependent = await roleService.getWithDependent(id, req.context)

    log.end()
    return mapper.toModel(headRoleWithDependent, req.context)
}
