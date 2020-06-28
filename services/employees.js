/* eslint-disable indent */
'use strict'

const guid = require('guid')

const userService = require('./users')
const divisionService = require('./divisions')
const designationService = require('./designations')
const departmentService = require('./departments')

const userGetter = require('./user-getter')
const profileService = require('./profiles')
const addressService = require('./addresses')

const roleTypeService = require('./role-types')

const dates = require('../helpers/dates')

const db = require('../models')

const offline = require('@open-age/offline-processor')

const populate = 'user department division designation organization'

const set = async (model, entity, context) => {
    if (model.doj) {
        entity.doj = model.doj
    }

    if (model.reason) {
        entity.reason = model.reason.toLowerCase()
    }

    if (model.dol && model.dol !== entity.dol) {
        entity.dol = model.dol

        if (dates.date(entity.dol).isPast()) {
            model.status = 'inactive'
        }
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
        if (entity.user) {
            entity.profile = await profileService.get(model, entity.user.profile, context)
        }
    }

    if (model.address) {
        if (entity.user) {
            entity.address = await addressService.get(model, entity.user.address, context)
        }
    }

    if (model.config) {
        if (model.config.biometricId) {
            model.config.biometricCode = model.config.biometricId
        }

        entity.config = entity.config || {}
        Object.keys(model.config).forEach(key => {
            entity.config[key] = model.config[key]
        })
        entity.markModified('config')
    }

    if (model.meta) {
        entity.meta = entity.meta || {}
        Object.getOwnPropertyNames(model.meta).forEach(key => {
            entity.meta[key] = model.meta[key]
        })
        entity.markModified('meta')
    }

    if (model.type) {
        entity.type = model.type
    }

    if (model.supervisor) {
        entity.supervisor = await this.get(model.supervisor, context)
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
        if (entity.user) {
            entity.user = await userService.update(entity.user.id || {
                employee: {
                    code: entity.code
                }
            }, {
                phone: entity.phone,
                email: entity.email,
                profile: entity.profile,
                password: model.password
            }, context)
        }
    }
}

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
    const log = context.logger.start('services/employees:create')

    if (!context.organization.owner) {
        data.code = data.code || 'default'
        data.status = 'active'
        data.type = 'superadmin'
    }

    if (data.code) {
        let existingEmployee = await this.get(data.code, context)

        if (existingEmployee) {
            throw new Error('CODE_EXISTS')
        }
    } else {
        data.code = await getNewEmployeeCode({}, context)
    }

    if (!data.email) {
        if (data.user) {
            data.email = data.user.email
        } else {
            data.email = `${data.code}@${context.organization.code}.com`
        }
    }

    if (!data.phone && data.user) {
        data.phone = data.user.phone
    }

    let user
    if (data.user) {
        user = await userGetter.get(data.user, context)
    }

    if (!user) {
        user = await userGetter.get({
            phone: data.phone,
            email: data.email
        }, context)
    }

    let employeeStatus = data.status || 'new'

    if (!user) {
        user = await userService.create({
            phone: data.phone,
            email: data.email,
            password: data.password,
            profile: await profileService.get(data, null, context),
            address: await addressService.get(data, null, context)
        }, context)
    }

    let entity = await this.get({ user: user }, context)

    if (!entity) {
        entity = new db.employee({
            code: data.code,
            user: user,
            type: data.type || 'normal',
            doj: data.doj || new Date(),
            status: employeeStatus,
            organization: context.organization,
            tenant: context.tenant
        })
    }

    await set(data, entity, context)
    await entity.save()

    if (!data.skipRole) {
        let roleType = await roleTypeService.get(`${context.organization.type || 'organization'}.${entity.type || 'employee'}`, context)

        let roleStatus = entity.status

        switch (employeeStatus) {
            case 'in-complete':
                roleStatus = 'active'
                break
        }

        let role = new db.role({
            key: guid.create().value,
            code: entity.code,
            phone: data.phone,
            email: data.email,
            user: user,
            status: roleStatus,
            type: roleType,
            employee: entity,
            organization: context.organization,
            tenant: context.tenant
        })
        await role.save()
        entity.role = role
    }

    if (!data.skipHook) {
        await offline.queue('employee', 'create', entity, context)
    }

    log.end()
    return entity
}

exports.update = async (id, model, context) => {
    let log = context.logger.start('services/employees:update')

    let entity = await this.get(id, context)

    let status = entity.status
    await set(model, entity, context)

    await entity.save()

    await offline.queue('employee', 'update', entity, context)

    if (entity.status !== status) {
        await offline.queue('employee', entity.status, entity, context)
    }

    log.end()
    return entity
}

exports.search = async (query, paging, context) => {
    context.logger.start('search')

    let sorting = ''
    if (paging && paging.sort) {
        sorting = paging.sort
    }

    let sort = {}

    switch (sorting) {
        default:
            sort['profile.firstName'] = 1
            break
    }

    query = query || {}

    let where = {
        status: 'active',
        organization: context.organization
        // tenant: context.tenant
    }

    if (query.status && query.status !== 'all') {
        where['status'] = query.status
    }

    if (query.name) {
        where.$or = [{
            'profile.firstName': {
                '$regex': '^' + query.name,
                $options: 'i'
            }
        }, {
            'profile.lastName': {
                '$regex': '^' + query.name,
                $options: 'i'
            }
        }]
    }
    if (query.code) {
        where['code'] = query.code
    }

    if (query.designation) {
        where.designation = await designationService.get(query.designation, context)
    } else if (query.designations) {
        where.designation = {
            $in: query.designations.split(',').map(i => i.toObjectId())
        }
    }

    if (query.department) {
        where.department = await departmentService.get(query.department, context)
    } else if (query.departments) {
        where.department = {
            $in: query.departments.split(',').map(i => i.toObjectId())
        }
    }

    if (query.division) {
        where.division = await divisionService.get(query.division, context)
    } else if (query.divisions) {
        where.division = {
            $in: query.divisions.split(',').map(i => i.toObjectId())
        }
    }

    if (query.team && context.role.employee) {
        where.supervisor = context.role.employee
    }

    if (query.supervisor) {
        where.supervisor = await this.get(query.supervisor, context)
    }

    if (query.peers && context.role.employee) {
        where.supervisor = context.role.employee.supervisor
    }

    if (query.contractors) {
        where['config.contractor.name'] = {
            $in: query.contractors.split(',')
        }
    }

    if (query.employeeTypes) {
        where['config.employmentType'] = {
            $in: query.employeeTypes.split(',').map(item => item)
        }
    }

    if (query.userTypes) {
        where['type'] = {
            $in: query.userTypes.split(',').map(item => item)
        }
    }

    if (query.biometricId) {
        where['config.biometricCode'] = {
            $regex: query.biometricId,
            $options: 'i'
        }
    }

    if (query.type) {
        where.type = {
            $in: query.type.split(',').map(item => item.toLowerCase())
        }
    }

    if (query.terminationDate) {
        where.dol = {
            $gte: dates.date(query.terminationDate).bod(),
            $lte: dates.date(query.terminationDate).eod()
        }
    }

    if (query.terminationReason) {
        where['reason'] = {
            $in: query.terminationReason.split(',').map(i => i.toLowerCase())
        }
    }

    if (query.timeStamp) {
        where.timeStamp = {
            $gte: Date.parse(query.timeStamp)
        }
    }

    const count = await db.employee.find(where).count()
    let items
    if (paging) {
        items = await db.employee.find(where).sort(sort).skip(paging.skip).limit(paging.limit)
            .populate(populate)
            .populate({
                path: 'supervisor',
                populate: {
                    path: populate
                }
            })
    } else {
        items = await db.employee.find(where).sort(sort)
            .populate(populate)
            .populate({
                path: 'supervisor',
                populate: {
                    path: populate
                }
            })
    }

    return {
        count: count,
        items: items
    }
}

exports.get = async (query, context) => {
    context.logger.debug('service/employees:get')
    if (!query) {
        return null
    }

    let where = {
        tenant: context.tenant
    }

    if (context.organization) {
        where.organization = context.organization
    }

    if (query === 'my' || query.id === 'my' || query.code === 'my') {
        query = {
            id: context.employee.id
        }
    }

    if (typeof query === 'string') {
        if (query.isObjectId()) {
            return db.employee.findById(query)
                .populate(populate)
                .populate({
                    path: 'supervisor',
                    populate: {
                        path: populate
                    }
                })
        } else {
            where.code = query
        }
    } else if (query.id) {
        return db.employee.findById(query.id)
            .populate(populate)
            .populate({
                path: 'supervisor',
                populate: {
                    path: populate
                }
            })
    } else if (query.code) {
        where.code = query.code
    } else if (query.user) {
        where.user = query.user
    } else if (query.email) {
        where.email = query.email
    } else if (query.phone) {
        where.phone = query.phone
    }

    return db.employee.findOne(where)
        .populate(populate)
        .populate({
            path: 'supervisor',
            populate: {
                path: populate
            }
        })
}

exports.remove = async (id, context) => {
    context.logger.start('services:employees:remove')

    return this.update(id, {
        status: 'inactive'
    }, context)
}
