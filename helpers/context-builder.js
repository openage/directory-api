'use strict'
const db = require('../models')

const create = async (claims, logger) => {
    let context = {
        logger: logger || claims.logger
    }

    let log = context.logger.start('context-builder:create')

    if (claims.tenant && claims.tenant._doc) {
        context.tenant = claims.tenant
    } else if (claims.tenant && claims.tenant.id) {
        context.tenant = await db.tenant.findOne({ _id: claims.tenant.id }).populate('owner')
    } else if (claims.tenant && claims.tenant.code) {
        context.tenant = await db.tenant.findOne({ code: claims.tenant.code }).populate('owner')
    } else if (claims.tenant && claims.tenant.key) {
        context.tenant = await db.tenant.findOne({ key: claims.tenant.key }).populate('owner')
    }

    if (claims.organization && claims.organization._doc) {
        context.organization = claims.organization
    } else if (claims.organization && claims.organization.id) {
        context.organization = await db.organization.findOne({ _id: claims.organization.id }).populate('owner')
    } else if (claims.organization && claims.organization.key) {
        context.organization = await db.organization.findOne({ key: claims.organization.key }).populate('owner')
    } else if (claims.organization && claims.organization.code) {
        context.organization = await db.organization.findOne({ code: claims.organization.code }).populate('owner')
    }

    if (claims.user && claims.user._doc) {
        context.user = claims.user
    } else if (claims.user && claims.user.id) {
        context.user = await db.user.findOne({ _id: claims.user.id })
    }

    if (claims.role && claims.role._doc) {
        context.role = claims.role
    } else if (claims.role && claims.role.id) {
        context.role = await db.role.findOne({ _id: claims.role.id }).populate('user employee organization tenant type')
    } else if (claims.role && claims.role.key) {
        context.role = await db.role.findOne({ key: claims.role.key }).populate('user employee organization tenant type')
    } else if (claims.role && claims.role.code && context.tenant) {
        context.role = await db.role.findOne({
            code: claims.role.code,
            tenant: context.tenant,
            organization: null // TODO: figure out if null is supported
        }).populate('user employee organization tenant')
    }

    context.permissions = []
    if (context.role) {
        context.role.permissions = context.role.permissions || []
        context.tenant = context.role.tenant
        context.organization = context.role.organization
        context.employee = context.role.employee
        context.user = context.role.user

        context.permissions = context.role.permissions

        if (context.role.type && context.role.type.permissions) {
            context.role.type.permissions.forEach(permission => context.permissions.push(permission))
        }
    }

    context.hasPermission = (permission) => {
        return context.permissions.find(permission)
    }

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

    log.end()

    return context
}

exports.serializer = (context) => {
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

    return Promise.resolve(serialized)
}

exports.deserializer = (claims, logger) => {
    let obj = {}

    if (claims.roleId) {
        obj.role = {
            id: claims.roleId
        }
    }

    if (claims.userId) {
        obj.user = {
            id: claims.userId
        }
    }

    if (claims.employeeId) {
        obj.employee = {
            id: claims.employeeId
        }
    }

    if (claims.tenantId) {
        obj.tenant = {
            id: claims.tenantId
        }
    }

    if (claims.organizationId) {
        obj.organization = {
            id: claims.organizationId
        }
    }

    return create(claims, logger)
}

exports.create = create
