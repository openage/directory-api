
const db = require('../models')

const validator = require('validator')

exports.get = async (query, context) => {
    context.logger.silly('services/user-getter:get')
    if (!query) {
        return null
    }

    if (query._doc) {
        return query
    }

    if (typeof query === 'string') {
        if (query === 'my') {
            return context.user
        }

        if (query.isObjectId()) {
            return db.user.findById(query)
        }

        if (validator.isEmail(query)) {
            return exports.getByEmail(query, context)
        }

        if (validator.isMobilePhone(query)) {
            return exports.getByPhone(query, context)
        }

        return exports.getByCode(query, context)
    } else if (query.id) {
        if (query.id === 'my') {
            return db.user.findById(context.user.id)
        }

        return db.user.findById(query.id)
    } else if (query.code) {
        return exports.getByCode(query.code, context)
    }

    if (query.email) {
        return exports.getByEmail(query.email, context)
    }

    if (query.phone) {
        return exports.getByPhone(query.phone, context)
    }

    if (query.facebookId) {
        return exports.getByFacebookId(query.facebookId, context)
    }

    if (query.employee && query.employee.code) {
        return exports.getByEmployeeCode(query.employee.code, context)
    }

    if (query.student && query.student.code) {
        return exports.getByStudentCode(query.student.code, context)
    }

    return null
}

exports.getByCode = async (code, context) => {
    let log = context.logger.start('services/users:getByCode')

    let user = await db.user.findOne({
        code: code,
        tenant: context.tenant
    })

    log.end()
    return user
}

exports.getByEmail = async (emailId, context) => {
    let log = context.logger.start('services/users:getByEmail')
    let user = db.user.findOne({
        isTemporary: {
            $ne: true
        },
        email: emailId,
        tenant: context.tenant
    })

    log.end()
    return user
}

exports.getByPhone = async (phoneNumber, context) => {
    let log = context.logger.start('services/users:getByPhone')

    let user = db.user.findOne({
        isTemporary: {
            $ne: true
        },
        phone: phoneNumber,
        tenant: context.tenant
    })

    log.end()
    return user
}

exports.getByFacebookId = async (facebookId, context) => {
    let log = context.logger.start('services/users:getByPhone')

    let user = db.user.findOne({
        isTemporary: {
            $ne: true
        },
        facebookId: facebookId,
        tenant: context.tenant
    })

    log.end()
    return user
}

exports.getByEmployeeCode = async (code, context) => {
    let log = context.logger.start('services/users:getByEmployeeCode')

    let employee = await db.employee.findOne({
        code: code,
        organization: context.organization
        // tenant: context.tenant
    }).populate('user')

    if (!employee) {
        throw new Error('employee not found')
    }

    log.end()
    return employee.user
}

exports.getByStudentCode = async (code, context) => {
    let log = context.logger.start('services/users:getByStudentCode')

    let user = db.user.findOne({
        isTemporary: {
            $ne: true
        },
        code: code,
        tenant: context.tenant
    })

    log.end()
    return user
}

exports.search = async (query, paging, context) => {
    let log = context.logger.start('users:search')

    let where = {
        tenant: context.tenant,
        organization: context.organization
    }

    if (query.status) {
        where.status = query.status
    } else {
        where.status = {
            $ne: 'inactive'
        }
    }

    if (query.phone) {
        where.phone = query.phone
    }

    if (query.text) {
        where.$or = [{
            phone: {
                $regex: '^' + query.text,
                $options: 'i'
            }
        }, {
            email: {
                $regex: '^' + query.text,
                $options: 'i'
            }
        }, {
            'profile.firstName': {
                $regex: '^' + query.text,
                $options: 'i'
            }
        }, {
            'profile.lastName': {
                $regex: '^' + query.text,
                $options: 'i'
            }
        }]
    }

    if (query.name) {
        where.$or = [{
            'profile.firstName': {
                $regex: '^' + query.name,
                $options: 'i'
            }
        }, {
            'profile.lastName': {
                $regex: '^' + query.name,
                $options: 'i'
            }
        }]
    }

    if (query.isTemporary) {
        where.isTemporary = !!(query.isTemporary)
    }

    if (query.isEmailValidate) {
        where.isEmailValidate = !!(query.isEmailValidate)
    }

    if (query.isPhoneValidate) {
        where.isPhoneValidate = !!(query.isPhoneValidate)
    }

    let users = await db.user.find(where)

    let userList = []
    for (let user of users) {
        let roles = await db.role.find({
            user: user.id,
            organization: { $exists: false },
            employee: { $exists: false }
        })

        user.roles = roles.map(role => {
            return {
                id: role.id,
                code: role.code
            }
        })
        userList.push(user)
    }
    log.end()
    return {
        items: userList
    }
}
