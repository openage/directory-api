'use strict'
const db = require('../models')
const locks = require('./locks')

const system = require('config').get('system')

const create = async (claims, logger) => {
    let context = {
        logger: logger || claims.logger,
        config: {
            timeZone: 'IST'
        },
        permissions: []
    }

    let log = context.logger.start('context-builder:create')

    context.setTenant = async (tenant) => {
        if (!tenant) {
            return
        }

        if (tenant._doc) {
            context.tenant = tenant
        } else if (tenant.id) {
            context.tenant = await db.tenant.findById(tenant.id).populate('owner')
        } else if (tenant.code) {
            context.tenant = await db.tenant.findOne({ code: tenant.code }).populate('owner')
        } else if (tenant.key) {
            context.tenant = await db.tenant.findOne({ key: tenant.key }).populate('owner')
        } else {
            context.tenant = await db.tenant.findById(tenant).populate('owner')
        }
    }

    context.setOrganization = async (organization) => {
        if (!organization) {
            return
        }
        if (organization._doc) {
            context.organization = organization
        } else if (organization.id) {
            context.organization = await db.organization.findById(organization.id).populate('owner')
        } else if (organization.key) {
            context.organization = await db.organization.findOne({ key: organization.key }).populate('owner')
        } else if (organization.code) {
            context.organization = await db.organization.findOne({
                code: organization.code,
                tenant: context.tenant
            }).populate('owner')
        } else {
            context.organization = await db.organization.findById(organization).populate('owner')
        }

        if (context.organization.config) {
            context.config = context.organization.config
            context.config.timeZone = context.config.timeZone || 'IST'
        }
    }

    context.setUser = async (user) => {
        if (!user) {
            return
        }
        if (user._bsontype === 'ObjectID') {
            user = {
                id: user.toString()
            }
        }
        if (user._doc) {
            user.lastSeen = new Date()
            context.user = await user.save()
        } else if (user.id) {
            context.user = await db.user.findById(user.id)
            context.user.lastSeen = new Date()
            await context.user.save()
        }
    }

    context.setRole = async (role) => {
        if (!role) {
            if (context.organization && context.organization.owner) {
                context.role = context.organization.owner
            } else if (context.tenant && context.tenant.owner) {
                context.role = context.tenant.owner
            } else {
                context.role = system
            }
        } else if (role._doc) {
            context.role = role
        } else if (role.id) {
            context.role = await db.role.findById(role.id).populate('user employee organization tenant type')
        } else if (role.key) {
            context.role = await db.role.findOne({ key: role.key }).populate('user employee organization tenant type')
        } else if (role.code && context.organization) {
            context.role = await db.role.findOne({
                code: role.code,
                organization: context.organization
            }).populate('user employee organization tenant')
        } else if (role.code && context.tenant) {
            context.role = await db.role.findOne({
                code: role.code,
                tenant: context.tenant,
                organization: null
            }).populate('user employee organization tenant')
        } else {
            context.role = await db.role.findById(role).populate('user employee organization tenant type')
        }

        context.role.permissions = context.role.permissions || []
        if (!context.tenant) {
            await context.setTenant(context.role.tenant)
        }
        if (!context.organization) {
            await context.setOrganization(context.role.organization)
        }

        if (!context.employee) {
            context.employee = context.role.employee
        }

        if (!context.user) {
            await context.setUser(context.role.user)
        }

        context.permissions = context.role.permissions || []

        if (context.role.type && context.role.type.permissions) {
            context.role.type.permissions.forEach(permission => context.permissions.push(permission))
        }
    }

    await context.setTenant(claims.tenant)
    await context.setOrganization(claims.organization)
    await context.setUser(claims.user)
    await context.setRole(claims.role)

    context.where = () => {
        let clause = {}

        if (context.organization) {
            clause.organization = context.organization.id.toObjectId()
        }
        if (context.tenant) {
            clause.tenant = context.tenant.id.toObjectId()
        }
        let filters = {}

        filters.add = (field, value) => {
            if (value) {
                clause[field] = value
            }
            return filters
        }

        filters.clause = clause

        return filters
    }

    context.lock = async (resource) => {
        return locks.acquire(resource, context)
    }
    log.end()

    return context
}

exports.serializer = async (context) => {
    let serialized = {}

    if (context.role) {
        serialized.roleId = context.role.id
    }

    if (context.user) {
        serialized.userId = context.user.id
    }

    if (context.employee) {
        serialized.employeeId = context.employee.id
    }

    if (context.tenant) {
        serialized.tenantId = context.tenant.id
    }

    if (context.organization) {
        serialized.organizationId = context.organization.id
    }

    return serialized
}

exports.deserializer = async (claims, logger) => {
    return create(claims, logger)
}

exports.create = create
