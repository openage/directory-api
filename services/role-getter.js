const db = require('../models')
const employeeService = require('./employees')

const populateOthers = 'type user organization tenant'

const populateEmployee = {
    path: 'employee',
    populate: {
        path: 'designation division department supervisor'
    }
}

const populateStudent = {
    path: 'student',
    populate: {
        path: 'batch course institute'
    }
}

const addResponsibilities = async (role) => {
    if (!role) {
        return
    }
    if (role.employee) {
        let teamSize = await db.employee.find({
            supervisor: role.employee,
            status: 'active'
        }).count()

        if (teamSize > 0) {
            role.employee.isSupervisor = true
        }

        let studentsSize = await db.student.find({
            mentor: role.employee,
            status: 'active'
        }).count()

        if (studentsSize > 0) {
            role.employee.isMentor = true
        }
    }

    return role
}

const getOne = async (query) => {
    let role = await db.role.findOne(query)
        .populate(populateOthers)
        .populate(populateEmployee)
        .populate(populateStudent)

    return addResponsibilities(role)
}

exports.getByKey = async (key, context) => {
    context.logger.silly('getByKey')

    return getOne({ key: key })
}

exports.getById = async (id, context) => {
    context.logger.start('getById')

    let role = await db.role.findById(id)
        .populate(populateOthers)
        .populate(populateEmployee)
        .populate(populateStudent)

    return addResponsibilities(role)
}

exports.getByCode = async (code, context) => {
    context.logger.start('getByCode')

    let where = {
        organization: context.organization,
        tenant: context.tenant
    }

    where['$or'] = [{
        code: code
    }, {
        previousCode: code
    }]

    let role = await getOne(where)
    if (role) {
        return role
    } else {
        if (context.hasPermission(['system.manage', 'tenant.admin'])) {
            delete where.organization
            return getOne(where)
        } else {
            return null
        }
    }
}

exports.getByUser = async (user, context) => {
    context.logger.silly('getByUser')

    return getOne({
        user: user.id,
        organization: context.organization,
        tenant: context.tenant
    })
}

exports.getByStudent = async (student, context) => {
    context.logger.silly('getByStudent')

    return getOne({
        student: student.id,
        organization: context.organization,
        tenant: context.tenant
    })
}

exports.getByEmployee = async (model, context) => {
    context.logger.silly('getByEmployee')

    let employee = await employeeService.get(model, context)

    if (!employee) {
        return
    }

    let where = {
        employee: employee.id,
        tenant: context.tenant
    }
    if (context.organization) {
        where.organization = context.organization
    }

    return getOne(where)
}

exports.getDefault = async (user, context) => {
    return getOne({
        user: user,
        organization: { $exists: false },
        tenant: context.tenant
    })
}

exports.get = async (query, context) => {
    context.logger.silly('services/roles:get')

    if (typeof query === 'string') {
        if (query === 'my') {
            return exports.getById(context.role.id, context)
        }

        if (query.isObjectId()) {
            return exports.getById(query, context)
        } else if (query.isEmail()) {
            let where = {
                email: query.toLowerCase(),
                tenant: context.tenant
            }
            if (context.organization) {
                where.organization = context.organization
            }
            let role = await getOne(where)
            if (!role) {
                role = await exports.getByEmployee({ email: query.toLowerCase() }, context)
            }
            return role
        } else if (query.isMobile()) {
            let where = {
                phone: query,
                tenant: context.tenant
            }
            if (context.organization) {
                where.organization = context.organization
            }
            let role = await getOne(where)
            if (!role) {
                role = await exports.getByEmployee({ phone: query }, context)
            }
            return role
        }
        return exports.getByCode(query, context)
    } else if (query.id) {
        if (query.id === 'my') {
            return exports.getById(context.role.id, context)
        }
        return exports.getById(query.id, context)
    } else if (query.code) {
        return exports.getByCode(query.code, context)
    } else if (query.key) {
        return exports.getByKey(query.key, context)
    } else if (query.user && query.user.id) {
        return exports.getByUser(query.user, context)
    } else if (query.employee && query.employee.id) {
        return exports.getByEmployee(query.employee, context)
    } else if (query.student && query.student.id) {
        return exports.getByStudent(query.student, context)
    }
    return null
}

exports.search = async (query, page, context) => {
    context.logger.start('services/roles:search')
    let where
    if (context.organization) {
        where = {
            tenant: context.tenant,
            organization: context.organization // TODO:
        }
    } else {
        where = {
            tenant: context.tenant
        }
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
            path: 'designation department division'
        }
    }).populate({
        path: 'student',
        populate: {
            path: 'batch course institute'
        }
    }).populate({
        path: 'dependents.role',
        populate: {
            path: 'user type'
        }
    })

    for (const role of roleList) {
        if (role.employee) {
            let teamSize = await db.employee.find({
                supervisor: role.employee,
                status: 'active'
            }).count()

            if (teamSize > 0) {
                role.employee.isSupervisor = true
            }

            let studentsSize = await db.student.find({
                mentor: role.employee,
                status: 'active'
            }).count()

            if (studentsSize > 0) {
                role.employee.isMentor = true
            }
        }
    }

    return roleList
}
