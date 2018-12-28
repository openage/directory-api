'use strict'

const logger = require('@open-age/logger')('roles')
const mapper = require('../mappers/role')
const roleService = require('../services/roles')
const roleTypes = require('../services/role-types')
const employeeService = require('../services/employees')
const offline = require('@open-age/offline-processor')
const organizationService = require('../services/organizations')
const userService = require('../services/users')

exports.get = async (req, res) => {
    logger.start('get')
    let identifier = req.params.id === 'my' ? req.context.role.id : req.params.id

    try {
        let role = identifier.isObjectId() ? await roleService.getById(identifier) : await roleService.getByCode(identifier)
        if (!role) {
            throw new Error(`invalid id ${identifier}`)
        }

        if (req.params.id !== 'my' || !identifier.isObjectId()) {
            role.key = undefined
            return res.data(mapper.toModel(role))
        }

        return res.data(mapper.toModel(role))
    } catch (error) {
        logger.error(error)
        return res.failure(error)
    }
}

exports.search = async (req, res) => {
    logger.start('search')
    try {
        let rolesList = await roleService.search(req.context)
        return res.page(mapper.toSearchModel(rolesList))
    } catch (error) {
        return res.failure(error)
    }
}

exports.create = async (req, res) => {
    let log = logger.start('api/roles:create')

    let type = null

    if (req.body.employee) {
        const user = req.context.user
        let roleTypeCode

        let identifier = req.body.organization.id || req.body.organization.code

        let organization = identifier.isObjectId()
            ? await organizationService.getById(identifier, req.context)
            : await organizationService.getByCode(identifier, req.context)

        if (!organization) {
            throw new Error('organization does not exist')
        } else {
            req.context.organization = organization
        }

        let employee = null

        let employeeModel = req.body.employee

        employeeModel.user = user
        employeeModel.phone = employeeModel.phone || user.phone
        employeeModel.email = employeeModel.email || user.email
        employeeModel.type = employeeModel.type
        employeeModel.status = 'new'

        employeeModel.profile = employeeModel.profile || {}
        let profileModel = employeeModel.profile
        profileModel.firstName = profileModel.firstName || user.profile.firstName
        profileModel.lastName = profileModel.lastName || user.profile.lastName
        profileModel.gender = profileModel.gender || user.profile.gender
        profileModel.dob = profileModel.dob || user.profile.dob

        employee = await employeeService.getOrCreate(employeeModel, req.context)
        log.debug(`${employee}`)
        roleTypeCode = `${req.context.organization.type || 'organization'}.${req.body.employee.type || 'employee'}`
        type = await roleTypes.get(roleTypeCode, req.context)

        let role = await roleService.getOrCreate({
            type: type,
            employee: employee,
            user: user,
            status: 'inactive'
        }, req.context)

        /* add permission to role start*/
        if (req.context.organization && req.context.organization.owner) {  //todo obsolete if condition
            let ownerId = req.context.organization.owner._doc ? req.context.organization.owner.id : req.context.organization.owner.toString()

            let permissions = role.permissions.concat(role.type.permissions)

            let hasPermissions = permissions.every(item => item !== roleTypeCode)

            if (hasPermissions || (role.status !== 'active')) {
                if (ownerId === role.id && hasPermissions) {
                    role.permissions.push(roleTypeCode)
                    await role.save()
                } else {
                    req.context.processSync = true

                    await offline.queue('role', 'create', {
                        id: role.id,
                        empType: req.body.employee.type,
                        permissions: [roleTypeCode],
                    }, req.context)
                }
            }
        }
        role.key = undefined
        return mapper.toModel(role)
    }

    let role = await roleService.get({
        code: req.body.code,
        organization: req.context.organization
    }, req.context)

    if (role) {
        throw new Error(`role code ${req.body.code} already exist`)
    }

    let user = await userService.getOrCreate({
        phone: req.body.phone,
        email: req.body.email,
        profile: req.body.profile
    }, req.context)

    type = await roleTypes.get(req.body.type, req.context)

    role = await roleService.getOrCreate({
        code: req.body.code,
        phone: req.body.phone,
        email: req.body.email,
        profile: req.body.profile,
        location: req.body.location,
        address: req.body.address,
        organization: req.context.organization,
        status: req.body.status,
        user: user,
        type: type
    }, req.context)
    /* add permission to role end*/

    // todo  student in organization
    // todo employee roleType

    role.key = undefined
    return mapper.toModel(role)
}

exports.update = async (req) => {
    let log = req.context.logger.start('update')

    let id = req.params.id !== 'my' ? req.params.id : req.context.role.id

    if (req.body.code) {
        let sameCodeRole = await roleService.getByCode(req.body.code)
        if (sameCodeRole) {
            throw new Error('code exist')
        }
    }

    let existingRole = await roleService.getById(id, req.context)

    if (existingRole.isCodeUpdated) {
        throw new Error('you can update code once')
    }

    let role = await roleService.update(req.body, existingRole, req.context)

    log.end()

    return mapper.toModel(role)
}

exports.codeAvailable = async (req) => {
    let role = await roleService.getByCode(req.body.code)

    let data = {}

    data.isAvailable = !role

    return data
}

