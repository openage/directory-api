'use strict'
const mapper = require('../mappers/employee')
const roleService = require('../services/roles')
const employeeService = require('../services/employees')
const roleTypeService = require('../services/role-types')
const paging = require('../helpers/paging')
const db = require('../models')
const userService = require('../services/users')
const designationService = require('../services/designations')
const offline = require('@open-age/offline-processor')

const employeeManager = async (data, context) => {
    context.logger.start('employeeBuilder')

    if (!data.Email && !data.Phone) { return }

    let user = await userService.getOrCreate({
        email: data.Email,
        phone: data.Phone
    }, context)

    let employee = null

    let model = {
        user: user.id,
        email: data.Email || user.email,
        phone: data.Phone || user.phone,
        code: data.Code || '',
        status: data.Status || 'active',
        organization: context.organization.id,
        profile: {
            firstName: data.FirstName || null,
            lastName: data.LastName || null,
            dob: data.Dob || null,
            fatherName: data.FatherName || null,
            gender: data.Gender,
            bloodGroup: data.BloodGroup || null
        },
        address: {
            line1: data.Address1 || null,
            line2: data.Address2 || null,
            district: data.District || null,
            city: data.City || null,
            state: data.State || null,
            pinCode: data.Pincode || null,
            country: data.Country || null
        },
        department: data.Department,
        division: data.Division
    }
    model.password = await userService.setPassword(data.password || '1234')

    let designation = await designationService.designationManager(data.Designation, context)
    model.designation = designation

    if (model.code) {
        employee = await employeeService.getByCode(model.code, context)
        if (employee) { return employee }
    }

    employee = await employeeService.getOrCreate(model, context)

    let roleType = await roleTypeService.get(model.roleCode || 'employee', context)

    await roleService.getOrCreate({
        type: roleType,
        user: user,
        employee: employee
    }, context)

    return employee
}

exports.create = async (req, res) => {
    let model = req.body

    let user = await userService.getOrCreate({
        phone: req.body.phone,
        email: req.body.email
    }, req.context)

    let profile = model.profile || user.profile || {}
    profile.pic = profile.pic || {}
    profile.pic.url = profile.pic.url || undefined
    profile.pic.thumbnail = profile.pic.thumbnail || undefined

    let employee = await employeeService.getOrCreate({
        code: model.code,
        phone: model.phone || user.phone,
        email: model.email || user.email,
        profile: profile,
        address: model.address || user.address,
        supervisor: model.supervisor,
        division: model.division,
        designation: model.designation,
        department: model.department,
        user: user,
        type: model.type,
        status: model.status || 'active'
    }, req.context)

    let roleType = await roleTypeService.get(model.role ? model.role.code :
        `${req.context.organization.type || 'organization'}.${employee.type}`,
        req.context)

    await roleService.getOrCreate({
        type: roleType,
        user: user,
        employee: employee
    }, req.context)

    req.context.processSync = true
    offline.queue('employee', 'update', {
        id: employee.id
    }, req.context)

    return mapper.toModel(employee)
}

exports.update = async (req, res) => {
    let identifier = req.params.id === 'my' ? req.context.employee.id : req.params.id
    let existEmployee = await db.employee.findById(identifier)

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

    return mapper.toModel(updatedEmployee)
}

exports.get = async (req, res) => {
    let identifier = req.params.id === 'my' ? req.context.employee.id : req.params.id

    let employee = identifier.isObjectId()
        ? await await employeeService.getById(identifier, req.context)
        : await await employeeService.getByCode(identifier, req.context)


    employee.role = await db.role.findOne({
        employee: employee.id,
        organization: employee.organization.id || existingEmployee.organization.toString(),
        tenant: req.context.tenant.id
    }).populate('type')

    if (req.params.id !== 'my') {
        employee.role.key = undefined
    }

    return mapper.toModel(employee)
}

exports.search = async (req, res) => {
    let log = req.context.logger.start('api/employees:search')

    let where = {                                   //todo for active status
        organization: req.context.organization
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

    if (req.query.type) {
        where.type = req.query.type.toLowerCase()
    }

    let timeStamp = req.query.lastModifiedDate || req.query.timeStamp
    if (timeStamp) {
        where.timeStamp = {
            $gte: Date.parse(timeStamp)
        }
    }

    let query = employeeService.search(where, req.context)
    let pageInput = paging.extract(req)

    let items = await (pageInput ? query.skip(pageInput.skip).limit(pageInput.limit) : query)

    let page = {
        items: mapper.toSearchModel(items)
    }

    if (pageInput) {
        page.total = await query.count()
        page.pageNo = pageInput.pageNo
        page.pageSize = pageInput.limit
    }

    log.end()
    return page
}

exports.bulkUpload = async (req) => {
    let logger = req.context.logger.start('bulkUpload')

    let employeesData = req.data

    return Promise.each(employeesData, async (empData) => {
        let newEmployee = await employeeManager(empData, req.context)
        if (!newEmployee) { return }

        if (!empData.SupervisorCode) {
            logger.info(`no supervisor found ${newEmployee.code}`)
            return
        }

        let supervisor = await employeeService.getByCode({ code: empData.SupervisorCode }, req.context)
        if (!supervisor) {
            let supervisorModel = employeesData.find(item => item.Code === empData.SupervisorCode)
            if (supervisorModel) {
                supervisor = await employeeManager(supervisorModel, req.context)
            }
        }
        return employeeService.setSupervisor(newEmployee, supervisor, req.context)
    }).then(() => {
        return 'file successfully upload'
    })
}

exports.delete = async (req) => {
    let log = req.context.logger.start('delete')

    return employeeService.remove(req.params.id, req.context).then((employee) => {
        return 'employee successfully delete'
    })
}
