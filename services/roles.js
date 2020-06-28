'use strict'
const Guid = require('guid')
const db = require('../models')
const types = require('./role-types')
const offline = require('@open-age/offline-processor')
const profileService = require('./profiles')

const roleGetter = require('./role-getter')
const userGetter = require('./user-getter')

const organizationService = require('./organizations')
const employeeService = require('./employees')
const studentService = require('./students')
const permissionsGroup = require('./permission-groups')

const uniqueCodeGenerator = async (user, context) => {
    context.logger.silly('services/roles:uniqueCodeGenerator')
    if (user.phone) {
        let role = await roleGetter.getByCode(user.phone, context)
        if (!role) {
            return user.phone
        }
    }

    const getCodeFromProfile = async () => {
        let code = await profileService.generateCode(user.profile)
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

    if (model.permissions && model.permissions.length) {
        entity.permissions = await permissionsGroup.filterPermissions(await this.filterPermissionsByType(model.permissions, entity.type, context), context)
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
    let user = context.user
    if (data.user) {
        user = await userGetter.get(data.user, context)
    }

    let hooks = []
    if (data.organization) {
        context.organization = await organizationService.get(data.organization, context)
        if (!context.organization) {
            data.organization.skipHook = true
            context.organization = await organizationService.create(data.organization, context)
            hooks.push({
                type: 'organization',
                trigger: 'create',
                entity: context.organization
            })
        }
    }

    let employee
    if (data.employee) {
        employee = await employeeService.get({ user: data.user }, context)

        if (employee) {
            throw new Error('EMPLOYEE_ALREADY_EXIST')
        }

        data.employee.user = user
        data.employee.skipRole = true
        data.employee.skipHook = true
        employee = await employeeService.create(data.employee, context)

        hooks.push({
            type: 'employee',
            trigger: 'create',
            entity: employee
        })

        data.code = employee.code
        data.email = employee.email
        data.phone = employee.phone
    }

    let student

    if (data.student) {
        student = await studentService.get({ user: data.user }, context)

        if (student) {
            throw new Error('STUDENT_ALREADY_EXIST')
        }

        data.student.user = user
        data.student.skipRole = true
        data.student.skipHook = true

        student = await studentService.create(data.student, context)

        hooks.push({
            type: 'student',
            trigger: 'create',
            entity: student
        })
        data.code = student.code
        data.email = student.email
        data.phone = student.phone
    }

    data.permissions = data.permissions || []
    data.key = Guid.create().value
    data.status = context.organization ? 'new' : 'active' // new role in an organization needs to approved

    if (!data.type) {
        if (data.employee) {
            let organizationType = context.organization.type || 'organization'
            let userType = employee.type || 'employee'
            data.type = {
                code: `${organizationType}.${userType}`
            }
            if (!context.organization.owner) { // the new user would be given owner role
                data.type = {
                    code: `${organizationType}.superadmin`
                }
                data.status = 'active'
            } else {
                data.type = {
                    code: 'user',
                    name: 'User'
                }
            }
        } else if (data.student) {
            data.type = 'student'
        } else if (!context.tenant.owner) { // the new user would be given owner role
            data.type = {
                code: 'tenant.admin',
                name: 'Admin'
            }
            data.status = 'active'
        } else {
            data.type = {
                code: 'user',
                name: 'User'
            }
        }
    }
    let roleType
    if (typeof query === 'string') {
        roleType = await types.get(data.type, context)
    } else {
        roleType = await types.create(data.type, context)
    }

    if (!data.code) {
        data.code = await uniqueCodeGenerator(data.user, context)
    }

    if (!data.organization && !data.code) {
        throw new Error('CODE_INVALID')
    }

    let role = await new db.role({
        key: data.key,
        code: data.code,
        email: data.email || user.email,
        phone: data.phone || user.phone,
        meta: data.meta || {},
        user: user,
        type: roleType,
        employee: employee,
        student: student,
        organization: context.organization,
        tenant: context.tenant
    }).save()

    hooks.push({
        type: 'role',
        trigger: 'create',
        entity: role
    })

    if (context.organization && !context.organization.owner) {
        context.organization.owner = role
        await context.organization.save()
    }

    if (context.user) {
        if (user.id === context.user.id) {
            context.role = role
        }
    }

    for (const hook of hooks) {
        await offline.queue(hook.type, hook.trigger, hook.entity, context)
    }

    log.end()
    return role
}

exports.search = roleGetter.search

exports.update = async (id, model, context) => {
    context.logger.start('services/roles:update')

    let role = await roleGetter.getById(id, context)

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

exports.filterPermissionsByType = async (permissions, type, context) => {
    let log = context.logger.start('services/roles:filterPermissionsByType')

    let filterd = []

    for (const permission of permissions) {
        let exist = false
        for (const item of type.permissions) {
            if (item == permission) {
                exist = true
            }
        }
        if (!exist) {
            filterd.push(permission)
        }
    }

    log.end()

    return filterd
}

exports.getOrCreate = async (data, context) => {
    let role = await roleGetter.get(data, context)

    if (role) { return role }

    return exports.create(data, context)
}

exports.getWithDependent = getWithDependent
exports.addExtraPermission = addExtraPermission

exports.uniqueCodeGenerator = uniqueCodeGenerator

exports.getByKey = roleGetter.getByKey
exports.getById = roleGetter.getById
exports.get = roleGetter.get
exports.getByCode = roleGetter.getByCode
