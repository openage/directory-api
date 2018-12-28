'use strict'
const logger = require('@open-age/logger')('services/hooks')
const client = new (require('node-rest-client-promise')).Client()
const employees = require('./employees')
const roles = require('./roles')
const db = require('../models')

const getHeader = (config, data) => {
    let headers = {}
    Object.keys(config.headers).forEach(key => {
        headers[key] = config.headers[key].inject(data)
    })

    return headers
}

exports.employeeCreate = async (id, context) => {
    let log = logger.start(`employeeCreate: ${id}`)

    let role = await roles.getById(id)

    if (role && !role.employee && !role.organization) {
        return Promise.resolve(null)
    }

    let employee = await employees.getById(role.employee.id)

    let empRole = {
        id: role.id,
        key: role.key
    }

    const employeeAndRole = {
        employee: employee,
        role: empRole
    }

    let promises = []

    require('config').get('tenants').forEach(tenant => {
        if (!tenant.hooks.onEmployeeCreate) {
            return
        }

        let hooksConfig = tenant.hooks.onEmployeeCreate

        promises.push(client.postPromise(hooksConfig.url, {
            headers: getHeader(hooksConfig, employeeAndRole.employee),
            data: employeeAndRole
        })
            .then((response) => {
                log.info('created :' + response.data.message)
                return Promise.resolve()
            })
            .catch(err => {
                log.error('err :' + err)
                return Promise.reject(err)
            }))
    })

    return Promise.all(promises)
}

exports.employeeUpdate = async (id, context) => {
    let log = logger.start(`employeeUpdate: ${id}`)

    let employee = await employees.getById(id)

    let role = await roles.get({ employee: id }, context)

    let empRole = {
        id: role.id,
        key: role.key
    }

    const employeeAndRole = {
        employee: employee,
        role: empRole
    }

    let promises = []

    require('config').get('tenants').forEach(tenant => {
        if (!tenant.hooks.onEmployeeUpdate) {
            return
        }

        let hooksConfig = tenant.hooks.onEmployeeUpdate

        promises.push(client.postPromise(hooksConfig.url, {
            headers: getHeader(hooksConfig, employeeAndRole.employee),
            data: employeeAndRole
        })
            .then((response) => {
                log.info('created :' + response.data.message)
                return Promise.resolve()
            })
            .catch(err => {
                log.error('err :' + err)
                return Promise.reject(err)
            }))
    })

    return Promise.all(promises)
}

exports.roleUpdate = async (id, context) => {
    let log = logger.start(`roleUpdate: ${id}`)

    let role = await db.role.findById(id).populate('user')

    let tenant = await db.tenant.findById({ _id: role.tenant }).lean()

    let promises = []

    tenant.services.forEach(service => {
        if (!service.hooks || !service.hooks.role || !service.hooks.role.onUpdate) {
            return
        }

        let hooksConfig = service.hooks.role.onUpdate

        promises.push(client.postPromise(hooksConfig.url, {
            headers: getHeader(hooksConfig, role),
            data: role
        })
            .then((response) => {
                log.info('created :' + response.data.message)
                return Promise.resolve()
            })
            .catch(err => {
                log.error('err :' + err)
                return Promise.reject(err)
            }))
    })

    return Promise.all(promises)
}

exports.organizationUpdate = async (id, context) => {
    let log = logger.start(`organizationUpdate: ${id}`)

    let organization = await db.organization.findById(id).populate('owner').lean()

    let promises = []

    let tenant = await db.tenant.findById({ _id: organization.owner.tenant }).lean()

    tenant.services.forEach(service => {
        if (!service.hooks || !service.hooks.organization || !service.hooks.organization.onUpdate) {
            return
        }

        let hooksConfig = service.hooks.organization.onUpdate

        promises.push(client.postPromise(hooksConfig.url, {
            headers: getHeader(hooksConfig, organization),
            data: organization
        })
            .then((response) => {
                log.info('created :' + response.data.message)
                return Promise.resolve()
            })
            .catch(err => {
                log.error('err :' + err)
                return Promise.reject(err)
            }))
    })

    return Promise.all(promises)
}
