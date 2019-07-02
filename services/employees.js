/* eslint-disable indent */
'use strict'

const userService = require('./users')
const divisionService = require('./divisions')
const designationService = require('./designations')
const departmentService = require('./departments')

const userGetter = require('./user-getter')
const profileService = require('./profiles')
const addressService = require('./addresses')

const roleGetter = require('./role-getter')
const roleTypeService = require('./role-types')

const dates = require('../helpers/dates')

const db = require('../models')

const offline = require('@open-age/offline-processor')

const getNewCode = async (field, context) => {
    let lock = await context.lock(`organization:${context.organization.id}:${field}`)

    let organization = await db.organization.findById(context.organization.id)

    let newCode = (organization[field] || 0) + 1

    organization[field] = newCode

    await organization.save()

    lock.release()

    return '' + newCode
}

const getNewEmployeeCode = async (options, context) => {
    return getNewCode('lastEmployeeCode', context)
}

exports.create = async (data, context) => {
    const log = context.logger.start('services/emloyees:create')

    if (!context.organization.owner) {
        data.code = 'default'
        data.status = 'active'
        data.type = 'superadmin'
    }

    if (data.code) {
        let existingEmployee = await db.employee.findOne({
            code: data.code,
            organization: context.organization
        })

        if (existingEmployee) {
            throw new Error('CODE_EXISTS')
        }
    } else {
        data.code = await getNewEmployeeCode({}, context)
    }

    if (!data.email && data.user) {
        data.email = data.user.email
    }

    if (!data.phone && data.user) {
        data.phone = data.user.phone
    }

    if (!data.email && !data.phone) {
        data.email = `${data.code}@${context.organization.code}.com`
    }

    if (!data.user) {
        data.user = await userGetter.get({
            phone: data.phone,
            email: data.email
        }, context)

        if (!data.user) {
            data.user = await userService.create({
                phone: data.phone,
                email: data.email,
                profile: await profileService.get(data, null, context),
                address: await addressService.get(data, null, context)
            }, context)
        }
    }

    const user = await userGetter.get(data.user, context)
    let employee = await db.employee.findOne({
        user: data.user,
        organization: context.organization
    }).populate('user department division designation organization').populate({
        path: 'supervisor',
        populate: {
            path: 'user department division designation organization'
        }
    })

    if (employee) {
        log.end()
        return employee
    }

    let config = {}
    if (data.config) {
        config = data.config
    }

    let model = {
        code: data.code,
        phone: data.phone,
        email: data.email,
        type: data.type || 'normal',
        profile: await profileService.get(data, user.profile, context),
        address: await addressService.get(data, user.address, context),
        status: data.status || 'new',
        user: user,
        config: config,
        doj: data.doj || new Date(),
        dol: data.dol,
        reason: data.reason,
        supervisor: await get(data.supervisor, context),
        division: await divisionService.get(data.division, context),
        designation: await designationService.get(data.designation, context),
        department: await departmentService.get(data.department, context),
        organization: context.organization,
        tenant: context.tenant
    }

    employee = await new db.employee(model).save()
    await offline.queue('employee', 'create', employee, context)

    log.end()
    return employee
}

const update = async (model, entity, context) => {
    let log = context.logger.start('services/employees:update')

    if (model.reason) {
        entity.reason = model.reason.toLowerCase()
    }
    if (model.reason && (model.dol && model.dol !== entity.dol)) {
        entity.dol = model.dol

        if (dates.date(entity.dol).isPast()) {
            model.status = 'inactive'
        }
    }
    if (model.doj) {
        entity.doj = model.doj
    }
    if (model.config && model.config.biometricId) {
        model.config.biometricCode = model.config.biometricId
    }

    if (model.status && model.status !== entity.status) {
        entity.status = model.status
        if (entity.status === 'inactive') {
            entity.dol = model.dol || new Date()
            entity.reason = model.reason
        }
        if (entity.status === 'active') {
            entity.dol = null
            entity.reason = null
            entity.doj = entity.doj || new Date()
        }
    }

    if (model.phone) {
        entity.phone = model.phone
    }

    if (model.email) {
        entity.email = model.email
    } else if (!model.email && !entity.email) {
        entity.email = `${model.code}@${context.organization.code}.com`
    }

    if (model.profile) {
        entity.profile = await profileService.get(model, entity.user.profile, context)
    }

    if (model.config) {
        entity.config = entity.config || {}
        Object.keys(model.config).forEach(key => {
            entity.config[key] = model.config[key]
        })
        entity.markModified('config')
    }

    if (model.address) {
        entity.address = model.address
    }

    if (model.status) {
        entity.status = model.status
    }

    if (model.type) {
        entity.type = model.type
    }

    if (model.supervisor) {
        entity.supervisor = await get(model.supervisor, context)
    }

    if (model.division) {
        entity.division = await divisionService.get(model.division, context)
    }

    if (model.designation) {
        entity.designation = await designationService.get(model.designation, context)
    }

    if (model.department) {
        entity.department = await departmentService.get(model.department, context)
    }

    if (context.tenant.code === 'aqua') {
        // TODO: this looks wrong
        entity.user = await userService.update(entity.user.id, {
            phone: entity.phone,
            email: entity.email,
            profile: entity.profile,
            password: model.password
        }, context)
    }

    await entity.save()

    await offline.queue('employee', 'update', entity, context)

    log.end()
    return getById(entity.id, context)
}

const search = (query, context) => {
    context.logger.start('search')
    query = query || {}

    query.organization = context.organization.id

    return db.employee.find(query).sort({
        'profile.firstName': 1
    }).populate('user department division designation organization').populate({
        path: 'supervisor',
        populate: {
            path: 'user department division designation organization'
        }
    })
}

const getById = async (id, context) => {
    context.logger.debug('service/employees:getById')
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
    context.logger.debug('service/employees:getByCode')
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
    if (!supervisor) {
        return null
    }

    employee.supervisor = supervisor

    return employee.save()
}

const get = async (query, context) => {
    context.logger.debug('service/employees:get')
    if (!query) {
        return null
    }

    if (typeof query === 'string') {
        if (query.isObjectId()) {
            return getById(query, context)
        } else {
            return getByCode(query, context)
        }
    }
    if (query.id) {
        return getById(query.id, context)
    }

    if (query.code) {
        return getByCode(query.code, context)
    }
    return null
}

const remove = async (id, context) => {
    context.logger.start('services:employees:remove')

    let employee = await db.employee.findById(id)

    // find role and inactive role

    return update({
        status: 'inactive'
    }, employee, context)
}

exports.update = update
exports.get = get
exports.getByCode = getByCode
exports.getById = getById
exports.search = search
exports.setSupervisor = setSupervisor
exports.remove = remove
