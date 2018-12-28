'use strict'
const logger = require('@open-age/logger')('services/organizations')
let updationScheme = require('../helpers/updateEntities')
const offline = require('@open-age/offline-processor')

const employeeService = require('../services/employees')
const divisionService = require('../services/divisions')
const designationService = require('../services/designations')
const departmentService = require('../services/departments')

const roleTypeService = require('../services/role-types')
const roleService = require('../services/roles')
const db = require('../models')

const create = async (data, context) => {
    let log = context.logger.start('create')
    let model = {
        name: data.name,
        code: data.code,
        shortName: data.shortName,
        type: data.type,
        location: data.location,
        address: data.address,
        status: 'new'
    }
    let organization = await new db.organization(model).save()

    context.organization = organization

    let division = await divisionService.create(data.division || {}, context)
    let designation = await designationService.create(data.designation || {}, context)
    let department = await departmentService.create(data.department || {}, context)

    let employee = await employeeService.create({
        user: context.user,
        division: division,
        department: department,
        designation: designation
    }, context)

    log.debug('employee created', employee)

    let newRoleType = await roleTypeService.get(`${context.organization.type || 'organization'}.admin`, context)

    let newRole = await roleService.getOrCreate({
        type: newRoleType,
        employee: employee,
        user: context.user,
        status: 'active'
    }, context)

    log.debug('role create', newRole)

    await update({
        owner: newRole
    }, organization, context)

    context.processSync = true

    await offline.queue('organization', 'create', {
        id: organization.id
    }, context)

    log.end()

    organization.role = newRole

    return organization
}

const getByIdOrCode = async (identifier, context) => {
    context.logger.start('services/organization:getByIdOrCode')

    let query = identifier.isObjectId() ? { _id: identifier } : { code: identifier }

    return db.organization.findOne(query)
}

const update = async (model, organization, context) => {
    let log = context.logger.start('services/organizations:update')

    let notifyToAdmin = ((model.status === 'active') && (organization.status === 'new'))

    if (model.name) {
        organization.name = model.name
    }
    if (model.code) {
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
    if (model.location) {
        organization.location = model.location
    }
    if (model.address) {
        organization.address = updationScheme.update(model.address, organization.address)
    }
    if (model.status) {
        organization.status = model.status
    }

    if (model.owner) {
        organization.owner = model.owner
    }

    let updatedOrg = await organization.save()

    context.processSync = true

    await offline.queue('organization', 'update', {
        id: updatedOrg.id
    }, context)

    if (notifyToAdmin) {
        offline.queue('organization', 'status', {
            id: updatedOrg.id
        }, context)
    }

    log.end()

    return db.organization.findById(updatedOrg.id)
        .populate({
            path: 'owner',
            populate: {
                path: 'designation division department'
            }
        })
}

const getById = async (id) => {
    logger.start('getById')

    return db.organization.findById(id).populate('owner')
}

const getByCode = async (code) => {
    logger.start('getByCode')

    return db.organization.findOne({ code: code })
}

const availableCodeFinder = async (existCode) => {
    if (typeof availableCodeFinder.num === 'undefined') {
        availableCodeFinder.num = 0
    }
    availableCodeFinder.num++
    let code = existCode + availableCodeFinder.num
    let organization = await db.organization.findOne({ code: code })

    if (!organization) { return code }
    return availableCodeFinder(code)
}

exports.create = create
exports.getByIdOrCode = getByIdOrCode
exports.update = update
exports.getById = getById
exports.getByCode = getByCode
exports.availableCodeFinder = availableCodeFinder
