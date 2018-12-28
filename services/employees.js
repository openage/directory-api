'use strict'

const logger = require('@open-age/logger')('services/employees')
const updationScheme = require('../helpers/updateEntities')

const divisionService = require('./divisions')
const designationService = require('./designations')
const departmentService = require('./departments')
const db = require('../models')

const offline = require('@open-age/offline-processor')

const create = async (data, context) => {
    logger.start('create')
    let model = {
        code: data.code,
        phone: data.phone,
        email: data.email,
        type: data.type,
        profile: data.profile || undefined,
        address: data.address || undefined,
        status: data.status || 'new',
        user: data.user
    }

    if (!model.code && model.status === 'active') {
        model.code = ++context.organization.lastEmployeeCode
        context.organization.lastEmployeeCode = model.code
        await context.organization.save()
    }

    if (data.supervisor) {
        model.supervisor = data.supervisor.id
            ? await getById(data.supervisor.id, context)
            : await getByCode(data.supervisor.code, context)
    }

    model.organization = context.organization
    model.division = await divisionService.get(data.division || { code: 'default' }, context)
    model.designation = await designationService.get(data.designation || { code: 'default' }, context)
    model.department = await departmentService.get(data.department || { code: 'default' }, context)
    // if (!model.user) { model.user = context.user.id }

    let newEmployee = await new db.employee(model).save()

    return db.employee.findById(newEmployee.id).populate('user department division designation organization').populate({
        path: 'supervisor',
        populate: {
            path: 'user department division designation organization'
        }
    })
}

const update = async (model, employee, context) => {
    logger.start('update')

    if (model.status === 'active' && employee.status === 'new' && !employee.code && !model.code) {
        model.code = ++context.organization.lastEmployeeCode
        context.organization.lastEmployeeCode = model.code
        await context.organization.save()
    }

    if (model.phone) {
        employee.phone = model.phone
    }

    if (model.email) {
        employee.email = model.email
    }

    if (model.profile) {
        employee.profile = employee.profile || {}
        updationScheme.update(model.profile, employee.profile)
    }

    if (model.address) {
        employee.address = model.address
    }

    if (model.status) {
        employee.status = model.status
    }

    if (model.type) {
        employee.type = model.type
    }

    if (model.supervisor) {
        employee.supervisor = model.supervisor.id
            ? await getById(model.supervisor.id, context)
            : await getByCode(model.supervisor.code, context)
    }

    if (model.division) {
        employee.division = await divisionService.get(model.division, context)
    }

    if (model.designation) {
        employee.designation = await designationService.get(model.designation, context)
    }

    if (model.department) {
        employee.department = await departmentService.get(model.department, context)
    }
    await employee.save()

    context.processSync = true
    offline.queue('employee', 'update', {
        id: employee.id
    }, context)

    return getById(employee.id, context)
}

const search = (query, context) => {
    logger.start('search')
    query = query || {}

    query.organization = context.organization.id

    return db.employee.find(query).sort({ 'profile.firstName': 1 }).populate('user department division designation organization').populate({
        path: 'supervisor',
        populate: {
            path: 'user department division designation organization'
        }
    })
}

const getById = async (id, context) => {
    logger.start('getById')
    return db.employee.findById(id).populate('user department division designation').populate({
        path: 'supervisor',
        populate: {
            path: 'user department division designation organization'
        }
    }).populate({
        path: 'organization',
        populate: {
            path: 'owner'
        }
    })
}

const getByCode = async (data, context) => {
    logger.start('get')
    return db.employee.findOne({
        code: data.code || data,
        organization: context.organization.id
    }).populate('user department division designation organization').populate({
        path: 'supervisor',
        populate: {
            path: 'user department division designation organization'
        }
    })
}

const setSupervisor = async (employee, supervisor, context) => {
    context.logger.start('service/employees:setSupervisor')
    if (!supervisor) { return null }

    employee.supervisor = supervisor

    return employee.save()
}

const get = async (query, context) => {
    context.logger.start('service/employees: get')
    return db.employee.findOne(query).populate('user department division designation organization').populate({
        path: 'supervisor',
        populate: {
            path: 'user department division designation organization'
        }
    })
}

const getOrCreate = async (data, context) => {
    context.logger.start('services/employees: getOrCreate')

    let employee = await get({
        user: data.user || context.user,
        organization: data.organization || context.organization
    }, context)

    if (employee) { return employee }

    return create(data, context)
}

const remove = async (id, context) => {
    context.logger.start('services:employees:remove')

    let employee = await db.employee.findById(id)

    // find role and inactive role

    return update({ status: 'inactive' }, employee, context)
}

exports.create = create
exports.update = update
exports.getByCode = getByCode
exports.getById = getById
exports.search = search
exports.setSupervisor = setSupervisor
exports.getOrCreate = getOrCreate
exports.remove = remove
