'use strict'
const logger = require('@open-age/logger')('services/roles')
const Guid = require('guid')
const db = require('../models')
const types = require('./role-types')
let updationScheme = require('../helpers/updateEntities')
const offline = require('@open-age/offline-processor')
const employeeService = require('./employees')

const getCodeFromProfile = async (profile) => {

    const selectCodeFromProfile = (profile) => {
        if (profile.firstName && profile.lastName) {
            return `${profile.firstName}.${profile.lastName}${Math.floor(Math.random() * 10000) + 10000}`
        }

        if (profile.firstName) {
            return `${profile.firstName}${Math.floor(Math.random() * 10000000) + 10000000}`
        }

        return Math.floor(Math.random() * 1000000000) + 1000000000
    }

    let code = selectCodeFromProfile(profile)

    let role = await getByCode(code)

    if (!role) {
        return code
    } else {
        getCodeFromProfile(profile)
    }
}

const uniqueCodeGenerator = async (user) => {
    let log = logger.start('services/roles:uniqueCodeGenerator')
    let uniqueCode

    if (user.phone) {
        let role = await getByCode(user.phone)
        if (!role) {
            uniqueCode = user.phone
        } else {
            uniqueCode = await getCodeFromProfile(user.profile)
        }
    } else {
        uniqueCode = await getCodeFromProfile(user.profile)
    }

    log.info(`unique code: ${uniqueCode}`)
    log.end()
    return uniqueCode
}

const set = (model, entity, context) => {

    if (model.code) {
        entity.previousCode = entity.code
        entity.isCodeUpdated = true
        entity.code = model.code
    }

    if (model.status) {
        entity.status = model.status
    }

    if (model.type) {
        entity.type = model.type
    }

    if (model.permissions && model.permissions.length) {
        let permissions = (entity.permissions.concat(entity.type.permissions)) || []
        for (let index = 0; index < model.permissions.length; index++) {
            let permission = model.permissions[index]
            if (permissions.every(item => item !== permission) && (permission === 'null')) {
                entity.permissions.push(permission)
            }
        }
    }

    if (model.dependents && model.dependents.length) {
        let entityDependents = entity.dependents || []
        for (let index = 0; index < model.dependents.length; index++) {
            let dependent = model.dependents[index]
            if (entity.id === dependent.role) { continue }
            if (entityDependents.every(item => item.role !== dependent.role)) {
                entityDependents.push(dependent)
            }
        }
        entity.dependents = entityDependents
    }
}

const create = async (data, context) => {
    data.tenant = context.tenant
    data.organization = context.organization
    data.key = Guid.create().value
    if (!data.type) {
        if (data.employee) {
            data.type = await types.get('employee', context)
        } else if (data.student) {
            data.type = await types.get('student', context)
        } else {
            data.type = await types.get('user', context)
        }
    }

    if (!data.code) {
        if (data.employee) {
            data.code = data.employee.code
        } else if (data.student) {
            data.code = data.student.code
        } else {
            data.code = await uniqueCodeGenerator(data.user)
        }
    }


    if (data.user && !data.employee && !data.organization && !data.code) {
        throw new Error('role code required')
    }

    let role = await new db.role(data).save()
    // context.processSync = true

    // offline.queue('role', 'create', {
    //     id: role.id
    // }, context)

    return db.role.findById(role.id).populate('type employee organization tenant user')
}

const getOrCreate = async (data, context) => {
    let role = await get(data, context)

    if (role) { return role }

    return create(data, context)
}

const search = async (context) => {
    logger.start('services/roles:search')
    let query = {
        tenant: context.tenant.id,
        user: context.user,
        status: { $ne: 'inactive' }
    }

    let roleList = db.role.find(query).populate('type user organization tenant').populate({
        path: 'employee',
        populate: {
            path: 'designation division'
        }
    }).populate({
        path: 'dependents.role',
        populate: {
            path: 'user type'
        }
    })

    return roleList
}

const getByKey = async (key, context) => {
    logger.start('getByKey')

    return db.role.findOne({ key: key }).populate('type employee user organization')
}

const getById = async (id) => {
    logger.start('getById')

    return db.role.findById(id).populate('type user organization tenant').populate({
        path: 'employee',
        populate: {
            path: 'designation division'
        }
    })
}

const get = async (query, context) => {
    let where = context.where()
    // if (query.type) {
    //     where.add('type.code', query.type.code || query.type)
    // }
    if (query.employee) {
        where.add('employee', query.employee.id || query.employee)
    }
    if (query.user) {
        where.add('user', query.user.id || query.user)
    }
    if (query.organization) {
        where.add('organization', query.organization.id || query.organization)
    }
    where.add('code', query.code)
    where.add('key', query.key)
    where.add('_id', query.id)

    return db.role.findOne(where.clause).populate('type employee user organization tenant')
}

const getByCode = async (code) => {
    logger.start('getByCode')

    return db.role.findOne({
        $or: [{
            code: code
        }, {
            previousCode: code
        }]
    }).populate('user')
}

const update = async (model, role, context) => {
    context.logger.start('services/roles:update')

    if (model.type) {
        model.type = await types.find(model.type, context)
    }

    set(model, role, context)

    if ((model.status === 'active') && role.employee) {
        if (role.employee.status !== 'active') {
            await employeeService.update({ status: 'active' }, role.employee, context)
        }
    }

    let updatedRole = await role.save()

    context.processSync = true

    offline.queue('role', 'update', {
        id: updatedRole.id
    }, context)

    return updatedRole
}

exports.getOrCreate = getOrCreate
exports.create = create
exports.search = search
exports.getByKey = getByKey
exports.getById = getById
exports.get = get
exports.getByCode = getByCode
exports.update = update