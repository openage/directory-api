'use strict'
const Guid = require('guid')
const db = require('../models')
const types = require('./role-types')
const offline = require('@open-age/offline-processor')
const profileService = require('./profiles')

const roleGetter = require('./role-getter')
const userGetter = require('./user-getter')

const organizationSevice = require('./organizations')
const employeeService = require('./employees')

const uniqueCodeGenerator = async (user, context) => {
    context.logger.silly('services/roles:uniqueCodeGenerator')
    if (user.phone) {
        let role = await roleGetter.getByCode(user.phone, context)
        if (!role) {
            return user.phone
        }
    }

    const getCodeFromProfile = async () => {
        let code = profileService.generateCode(user.profile)
        let role = await roleGetter.getByCode(code, context)

        if (!role) {
            return code
        } else {
            return getCodeFromProfile(user.profile)
        }
    }

    return getCodeFromProfile()
}

const set = async (model, entity, context) => {
    if (model.code && (model.code !== entity.code)) {
        if (entity.isCodeUpdated) {
            throw new Error('CODE_ALREADY_UPDATED')
        }

        if (await roleGetter.get(model.code, context)) {
            throw new Error('CODE_INVALID')
        }

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
            if (permissions.every(item => item !== permission)) {
                if (permission !== 'null') {
                    entity.permissions.push(permission)
                }
            }
        }
    }

    if (model.dependents && model.dependents.length) {
        let entityDependents = entity.dependents || []
        for (let index = 0; index < model.dependents.length; index++) {
            let dependent = model.dependents[index]
            if (entity.id === dependent.role) { continue }
            if (entityDependents.every(item => item.role !== dependent.role.id)) {
                entityDependents.push(dependent)
            }
        }
        entity.dependents = entityDependents
    }
}
/**
 * role being created by user
 *
*/
exports.create = async (data, context) => {
    const log = context.logger.start('services/roles:create')
    let user
    if (data.user) {
        user = await userGetter.get(data.user, context)
    } else {
        user = context.user
    }

    if (data.organization && !context.organization) {
        context.organization = await organizationSevice.get(data.organization, context)

        if (!context.organization) {
            context.organization = await organizationSevice.create(data.organization, context)
        }
    }

    let employee
    if (data.employee) {
        employee = await db.employee.findOne({
            user: data.user,
            organization: context.organization
        })

        if (employee) {
            throw new Error('EMPLOYEE_ALREADY_EXIST')
        }

        data.employee.user = user
        employee = await employeeService.create(data.employee, context)

        data.code = employee.code
    }

    let student
    if (data.student) {
        // TODO: implement
        // data.student.user = user
        // student = await studentService.create(data.student, context)
        // data.code = student.code
    }

    data.permissions = data.permissions || []
    data.key = Guid.create().value
    data.status = context.organization ? 'new' : 'active' // new role in an orgnization needs to approved

    if (!data.type) {
        if (data.employee) {
            let organizationType = context.organization.type || 'organization'
            let userType = employee.type || 'employee'
            data.type = `${organizationType}.${userType}`
            if (!context.organization.owner) { // the new user would be given owner role
                data.type = `${organizationType}.superadmin`
                data.status = 'active'
            }
        } else if (data.student) {
            data.type = 'student'
        } else if (!context.tenant.owner) { // the new user would be given owner role
            data.type = 'tenant.admin'
            data.status = 'active'
        } else {
            data.type = 'user'
        }
    }
    let roleType = await types.get(data.type, context)

    if (!data.code) {
        data.code = await uniqueCodeGenerator(data.user, context)
    }

    if (!data.employee && !data.organization && !data.code) {
        throw new Error('CODE_INVALID')
    }

    let role = await new db.role({
        key: data.key,
        code: data.code,
        user: user,
        type: roleType,
        employee: employee,
        student: student,
        organization: context.organization,
        tenant: context.tenant
    }).save()

    if (context.organization && !context.organization.owner) {
        context.organization.owner = role
        await context.organization.save()
    }

    await offline.queue('role', 'create', role, context)
    log.end()
    return role
}

exports.search = async (query, page, context) => {
    context.logger.start('services/roles:search')
    let where = {
        tenant: context.tenant
        // organization: context.organization //TODO:
    }

    if (query.status) {
        where.status = query.status
    } else {
        where.status = { $ne: 'inactive' }
    }

    if (query.user) {
        where.user = query.user
    }

    let roleList = await db.role.find(where).populate('type user organization tenant').populate({
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

exports.update = async (id, model, context) => {
    context.logger.start('services/roles:update')

    let role = await roleGetter.get(id, context)

    if (model.type) {
        model.type = await types.get(model.type, context)
    }

    await set(model, role, context)

    let updatedRole = await role.save()

    await offline.queue('role', 'update', {
        id: updatedRole.id
    }, context)

    return updatedRole
}

const getWithDependent = async (roleId, context) => {
    let log = context.logger.start('services:roles/getWithDependent')

    let role = db.role.findById(roleId).populate('type user tenant').populate({
        path: 'dependents.role',
        populate: {
            path: 'user type'
        }
    })

    log.end()
    return role
}

const addExtraPermission = async (permission, role, context) => { // add permission to role or send request to admin
    let log = context.logger.start(`services/roles:addExtraPermissions`)

    let ownerId = context.organization.owner._doc ? context.organization.owner.id : context.organization.owner.toString()

    let existingPermissions = role.permissions.concat(role.type.permissions)

    let hasPermissions = existingPermissions.every(item => item !== permission)

    if (hasPermissions || (role.status !== 'active')) {
        if (ownerId === role.id && hasPermissions) {
            role.permissions.push(permission)
            await role.save()
        } else {
            context.processSync = true
            offline.queue('role', 'create', {
                id: role.id,
                empType: role.employee.type,
                permissions: [permission]
            }, context)
        }
    }

    log.end()
    return role
}

exports.getOrCreate = async (data, context) => {
    let role = await roleGetter.get(data, context)

    if (role) { return role }

    return exports.create(data, context)
}

exports.getWithDependent = getWithDependent
exports.addExtraPermission = addExtraPermission

exports.getByKey = roleGetter.getByKey
exports.getById = roleGetter.getById
exports.get = roleGetter.get
exports.getByCode = roleGetter.getByCode
