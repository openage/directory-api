'use strict'
const mapper = require('../mappers/employee')
const employeeService = require('../services/employees')
const paging = require('../helpers/paging')
const db = require('../models')

let moment = require('moment')
const roleService = require('../services/roles')

const offline = require('@open-age/offline-processor')

exports.create = async (req) => {
    let model = req.body
    if (!model.email) {
        model.email = `${model.code}@${req.context.organization.code}.com`
    }
    let employee = await employeeService.create(model, req.context)

    employee.role = await employeeService.createRole(employee, req.context)

    employee.role.key = null

    await offline.queue('employee', 'notify-employee', employee, req.context)

    return mapper.toModel(employee, req.context)
}

exports.update = async (req) => {
    let identifier = req.params.id === 'my' ? req.context.employee.id : req.params.id
    let existEmployee = await db.employee.findById(identifier).populate('user')
    if (!existEmployee && req.body.code) {
        existEmployee = await db.employee.findOne({
            code: req.body.code,
            organization: req.context.organization,
            status: 'active'
        }).populate('user')
    }
    if (!existEmployee) {
        throw new Error(`employee with id '${req.params.id}' does not exist`)
    }

    if (req.body.code && existEmployee.code !== req.body.code) {
        let sameCodeEmp = await employeeService.getByCode({
            code: req.body.code
        }, req.context)
        if (sameCodeEmp) {
            throw new Error(`employee with code '${req.body.code}' exists`)
        }
    }

    let updatedEmployee = await employeeService.update(req.body, existEmployee, req.context)

    return mapper.toModel(updatedEmployee, req.context)
}

exports.get = async (req, res) => {
    let identifier = req.params.id === 'my' ? req.context.employee.id : req.params.id

    let employee

    if (identifier.isObjectId()) {
        employee = await employeeService.getById(identifier, req.context)
    } else {
        employee = await employeeService.getByCode(identifier, req.context)
    }

    employee.role = await db.role.findOne({
        employee: employee.id,
        organization: employee.organization,
        tenant: req.context.tenant.id
    }).populate('type')

    if (employee.role && req.params.id !== 'my') {
        employee.role.key = undefined
    }

    return mapper.toModel(employee, req.context)
}

exports.search = async (req) => {
    let log = req.context.logger.start('api/employees:search')
    req.query.status = req.query.status || 'active'
    req.query.type = req.query.type || req.query.userTypes

    let where = { // todo for active status
        organization: req.context.organization
    }
    if (req.query.status) {
        where['status'] = req.query.status
    }

    if (req.query.name) {
        where.$or = [{
            'profile.firstName': {
                '$regex': '^' + req.query.name,
                $options: 'i'
            }
        }, {
            'profile.lastName': {
                '$regex': '^' + req.query.name,
                $options: 'i'
            }
        }]
    }
    if (req.query.code) {
        where['code'] = req.query.code
    }

    if (req.query.biometricId) {
        where['config.biometricCode'] = {
            $regex: req.query.biometricId,
            $options: 'i'
        }
    }

    if (req.query.designations) {
        let designationList = []
        let queryDesignationList = req.query.designations.split(',')
        designationList = queryDesignationList.map(item => item.toObjectId())
        where['designation'] = {
            $in: designationList
        }
    }
    if (req.query.departments) {
        let departmentList = []
        let queryDepartmentList = req.query.departments.split(',')
        departmentList = queryDepartmentList.map(item => item.toObjectId())
        where['department'] = {
            $in: departmentList
        }
    }
    if (req.query.divisions) {
        let divisionList = []
        let queryDivisionList = req.query.divisions.split(',')
        divisionList = queryDivisionList.map(item => item.toObjectId())
        where['division'] = {
            $in: divisionList
        }
    }
    if (req.query.supervisor) {
        where['supervisor'] = req.query.supervisor.toObjectId()
    }

    if (req.query.contractors) {
        let contractorList = []
        let queryContractorsList = req.query.contractors.split(',')
        contractorList = queryContractorsList.map(item => item)
        where['config.contractor.name'] = {
            $in: contractorList
        }
    }

    if (req.query.employeeTypes) {
        let employeeTypeList = []
        let queryEmployeeTypeList = req.query.employeeTypes.split(',')
        employeeTypeList = queryEmployeeTypeList.map(item => item)
        where['config.employmentType'] = {
            $in: employeeTypeList
        }
    }

    if (req.query.type) {
        let typeList = []
        let queryTypeList = req.query.type.split(',')
        typeList = queryTypeList.map(item => item.toLowerCase())
        where.type = {
            $in: typeList
        }
    }
    if (req.query.terminationReason) {
        let terminationReasonList = []
        let queryterminationReasonList = req.query.terminationReason.split(',')
        terminationReasonList = queryterminationReasonList.map(item => item.toLowerCase())
        where['reason'] = {
            $in: terminationReasonList
        }
    }

    if (req.query.terminationDate) {
        let from = moment(req.query.terminationDate).startOf('day').toDate()
        let till = moment(req.query.terminationDate).endOf('day').toDate()
        where['dol'] = {
            $gte: from,
            $lte: till
        }
    }

    let timeStamp = req.query.lastModifiedDate || req.query.timeStamp
    if (timeStamp) {
        where.timeStamp = {
            $gte: Date.parse(timeStamp)
        }
    }

    let query = employeeService.search(where, req.context)
    let count = await db.employee.find(where).count()
    let pageInput = paging.extract(req)

    let items = await (pageInput ? query.skip(pageInput.skip).limit(pageInput.limit) : query)

    let page = {
        items: mapper.toSearchModel(items, req.context)
    }

    if (pageInput) {
        page.total = count
        page.pageNo = pageInput.pageNo
        page.pageSize = pageInput.limit
    }

    log.end()
    return page
}

exports.bulk = async (req) => {
    let added = 0
    let updated = 0
    for (const item of req.body.items) {
        let employee = await employeeService.get(item, req.context)
        if (employee) {
            if (item.newCode) {
                item.code = item.newCode
            }
            await employeeService.update(item, employee, req.context)
            updated = updated + 1
        } else {
            await employeeService.create(item, req.context)
            added = added + 1
        }
    }

    let message = `added: ${added}, updated: ${updated} employee(s)`

    req.context.logger.debug(message)

    return message
}

exports.delete = async (req) => {
    await employeeService.remove(req.params.id, req.context)
    return 'employee successfully delete'
}

exports.exists = async (req) => {
    let query = {
        organization: req.context.organization
    }
    if (req.query.email) {
        query.email = req.query.email
    } else if (req.query.phone) {
        query.phone = req.query.phone
    } else if (req.query.code) {
        query.code = req.query.code
    }

    let employee = await db.employee.findOne(query)

    return !!employee
}
