const db = require('../models')

exports.getByKey = async (key, context) => {
    context.logger.silly('getByKey')

    return db.role.findOne({ key: key }).populate('type user organization tenant').populate({
        path: 'employee',
        populate: {
            path: 'designation division department'
        }
    })
}

exports.getById = async (id, context) => {
    context.logger.start('getById')

    return db.role.findById(id).populate('type user organization tenant').populate({
        path: 'employee',
        populate: {
            path: 'designation division department'
        }
    })
}

exports.get = async (query, context) => {
    context.logger.silly('services/roles:get')
    let where = {
        organization: context.organization,
        tenant: context.tenant
    }
    if (typeof query === 'string') {
        if (query === 'my') {
            return exports.getById(context.role.id, context)
        }

        if (query.isObjectId()) {
            return db.role.findById(query)
        }
        where['code'] = query
        return db.role.findOne(where)
    } else if (query.id) {
        if (query.id === 'my') {
            return exports.getById(context.role.id, context)
        }

        return db.role.findById(query.id)
    } else if (query.code) {
        where['code'] = query.code
        return db.role.findOne(where)
    } else if (query.key) {
        where['key'] = query.key
        return db.role.findOne(where)
    } else if (query.user && query.user.id) {
        where['user'] = query.user.id
        return db.role.findOne(where)
    } else if (query.employee && query.employee.id) {
        where['employee'] = query.employee.id
        return db.role.findOne(where)
    }
    return null
}

// exports.get = async (query, context) => {
//     let where = {
//         organization: context.organization,
//         tenant: context.tenant
//     }
//     // if (query.type) {
//     //     where.add('type.code', query.type.code || query.type)
//     // }
//     if (query.employee) {
//         where.employee = query.employee.id || query.employee
//     }
//     if (query.user) {
//         where.user = query.user.id || query.user
//     }
//     if (query.organization) {
//         where.organization = query.organization.id || query.organization
//     }
//     where.add('code', query.code)
//     where.add('key', query.key)
//     where.add('_id', query.id)

//     return db.role.findOne(where.clause).populate('type user organization tenant').populate({
//         path: 'employee',
//         populate: {
//             path: 'designation division department'
//         }
//     })
// }

exports.getByCode = async (code, context) => {
    context.logger.start('getByCode')

    return db.role.findOne({
        $or: [{
            code: code
        }, {
            previousCode: code
        }]
    }).populate('type user organization tenant').populate({
        path: 'employee',
        populate: {
            path: 'designation division department'
        }
    })
}

exports.getDefault = async (user, context) => {
    return db.role.findOne({
        user: user,
        organization: { $exists: false },
        tenant: context.tenant
    }).populate('type user')
}
