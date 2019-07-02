'use strict'

const offline = require('@open-age/offline-processor')
const addressService = require('./addresses')
const locationService = require('./locations')
const roleGetter = require('./role-getter')

// const employeeService = require('../services/employees')
// const divisionService = require('../services/divisions')
// const designationService = require('../services/designations')
// const departmentService = require('../services/departments')

const db = require('../models')

exports.create = async (data, context) => {
    let log = context.logger.start('orngainzations:create')

    let existing = await exports.get(data.code, context)
    if (existing) {
        throw new Error('CODE_ALREADY_EXIST')
    }

    let organization = new db.organization({
        code: data.code.toLowerCase(),
        status: data.status || 'new',
        tenant: context.tenant
    })
    await set(data, organization, context)
    await organization.save()
    await offline.queue('organization', 'create', organization, context)
    log.end()
    return organization

    // await context.setOrganization(organization)

    // let employeeModel = data.employee || {}

    // let division = await divisionService.create(employeeModel.division || {
    //     code: 'default', name: 'Default'
    // }, context)
    // let designation = await designationService.create(employeeModel.designation || {
    //     code: 'default', name: 'Default'
    // }, context)
    // let department = await departmentService.create(employeeModel.department || {
    //     code: 'default', name: 'Default'
    // }, context)

    // let employee = await employeeService.create({
    //     type: employeeModel.type,
    //     code: employeeModel.code,
    //     status: employeeModel.status,
    //     role: employeeModel.role,
    //     user: context.user,
    //     profile: employeeModel.profile || context.user.profile.toObject(),
    //     email: context.user.email,
    //     phone: context.user.phone,
    //     division: division,
    //     department: department,
    //     designation: designation
    // }, context)

    // log.debug(`employee created ${employee.id}`)

    // organization.owner = employee.role
    // await organization.save()

    // TODO:
    // if (!newRole) {
    //     let newRoleType = await roleTypeService.get(roleModel.type, context)

    //     newRole = await roleService.getOrCreate({
    //         type: newRoleType,
    //         employee: employee,
    //         user: context.user,
    //         status: roleModel.status
    //     }, context)
    // }

    // log.debug(`new role created ${newRole.id}`)

    // organization.owner = newRole

    // context.processSync = true
    // await context.setRole(employee.role)

    // await offline.queue('organization', 'create', organization, context)

    // // organization.role = employee.role

    // log.end()
    // return organization
}

const getByIdOrCode = async (identifier, context) => {
    context.logger.start('services/organization:getByIdOrCode')

    let query = identifier.isObjectId() ? { _id: identifier } : { code: identifier }

    return db.organization.findOne(query)
}

const set = async (model, organization, context) => {
    let log = context.logger.start('services/organizations:update')
    if (model.name) {
        organization.name = model.name
    }
    if (model.code && (model.code !== organization.code)) {
        if (organization.previousCode) {
            throw new Error('CODE_ALREADY_UPDATED')
        }
        let existing = await db.organization.findOne({
            code: model.code.toLowerCase(),
            tenant: context.tenant
        })
        if (existing) {
            throw new Error('CODE_ALREADY_EXISTS')
        }
        organization.previousCode = organization.code
        organization.isCodeUpdated = true
        organization.code = model.code
    }
    if (model.shortName) {
        organization.shortName = model.shortName
    }
    if (model.type) {
        organization.type = model.type
    }

    if (model.phone) {
        organization.phone = model.phone
    }

    if (model.email) {
        organization.email = model.email
    }

    if (model.about) {
        organization.about = model.about
    }

    if (model.logo) {
        organization.logo = {
            url: model.logo.url,
            thumbnail: model.logo.thumbnail
        }
    }

    if (model.config) {
        organization.config = model.config
    }

    if (model.meta) {
        organization.meta = model.meta
    }

    if (model.location) {
        organization.location = await locationService.get(model, organization.location, context)
    }
    if (model.address) {
        organization.address = await addressService.get(model, organization.address, context)
    }
    if (model.status && organization.status !== model.status) {
        organization.status = model.status
    }

    if (model.owner) {
        organization.owner = await roleGetter.get(model.owner, context)
    }

    log.end()

    return organization
}

exports.update = async (id, model, context) => {
    let entity

    entity = await db.organization.findById(id).populate('owner')

    await set(model, entity, context)

    await entity.save()
    await offline.queue('organization', 'update', entity, context)

    return entity
}

const getById = async (id, context) => {
    context.logger.start('getById')
    return db.organization.findById(id).populate('owner')
}

const getByCode = async (code, context) => {
    context.logger.start('getByCode')
    return db.organization.findOne({ code: code, tenant: context.tenant })
}

const availableCodeFinder = async (existCode, context) => {
    if (typeof availableCodeFinder.num === 'undefined') {
        availableCodeFinder.num = 0
    }
    availableCodeFinder.num++
    let code = existCode + availableCodeFinder.num
    let organization = await getByCode(code, context)

    if (!organization) { return code }
    return availableCodeFinder(code)
}

exports.get = async (query, context) => {
    let where = {
        tenant: context.tenant
    }
    if (typeof query === 'string') {
        if (query === 'my') {
            return context.organization
        }

        if (query.isObjectId()) {
            return db.organization.findById(query).populate('owner')
        }
        where['code'] = query
        return db.organization.findOne(where).populate('owner')
    } else if (query.id) {
        return db.organization.findById(query.id).populate('owner')
    } else if (query.code) {
        if (query.code === 'my') {
            return context.organization
        }
        where['code'] = query.code
        return db.organization.findOne(where).populate('owner')
    }
    return null
}

exports.search = async (query, paging, context) => {
    let where = {
        tenant: context.tenant
    }

    if (query.type) {
        where.type = query.type
    }

    return { items: db.organization.find(where) }
}

exports.remove = async (id, context) => {
    // to delete all the employees
    // to delete all its divisions
    // to delete all its departments
    // to delete all its teamMembers
    // to delete all its designation
    // to delete from AMS

}

exports.getByIdOrCode = getByIdOrCode
exports.getById = getById
exports.getByCode = getByCode
exports.availableCodeFinder = availableCodeFinder
