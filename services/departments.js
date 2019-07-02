'use strict'

const db = require('../models')

const getNewCode = async (field, context) => {
    let lock = await context.lock(`organization:${context.organization.id}:${field}`)

    let organization = await db.organization.findById(context.organization.id)

    let newCode = (organization[field] || 0) + 1

    organization[field] = newCode

    await organization.save()

    lock.release()

    return '' + newCode
}

const getNewDepartmentCode = async (options, context) => {
    // let code = options.name.split(' ').join('').toLowerCase()

    return getNewCode('lastDepartmentCode', context)
}

const create = async (model, context) => {
    let log = context.logger.start('services/departments:create')
    if (!model.name) {
        throw new Error('name is needed')
    }

    if (!model.code) {
        model.code = await getNewDepartmentCode({
            name: model.name
        }, context)
    }
    let department = await db.department.findOne({
        code: model.code,
        organization: context.organization.id
    })

    if (department) {
        throw new Error('department code ' + model.code + ' with status ' + department.status + ' already exists')
    }

    department = await new db.department({
        code: model.code.toLowerCase(),
        name: model.name,
        organization: context.organization
    }).save()

    log.end()

    return department
}

const update = async (model, entity, context) => {
    context.logger.debug('services/departments:update')

    if (model.code) {
        if (entity.code.toLowerCase() !== model.code.toLowerCase()) {
            let exists = await db.department.findOne({
                code: model.code,
                organization: context.organization.id
            })

            if (exists) {
                throw new Error(`department with code '${model.code}' already exists`)
            }
        }

        entity.code = model.code
    }

    if (model.name) {
        entity.name = model.name
    }

    if (model.level) {
        entity.level = model.level
    }

    return entity.save()
}

const search = async (query, context) => {
    let log = context.logger.start('services/departments:search')
    query = query || {}

    let where = {
        organization: context.organization.id,
        status: query.status || 'active'
    }

    if (query.name) {
        where['name'] = {
            $regex: query.name,
            $options: 'i'
        }
    }
    if (query.code) {
        where['code'] = {
            $regex: query.code,
            $options: 'i'
        }
    } else {
        where['code'] = {
            $ne: 'default'
        }
    }

    let items = await db.department.find(where)

    log.end()

    return items
}

const get = async (query, context) => {
    context.logger.start('get')

    if (!query) {
        query = { code: 'default', name: 'Default' }
    }
    let department
    if (typeof query === 'string') {
        if (query.isObjectId()) {
            department = await db.department.findById(query)
        } else {
            department = await db.department.findOne({
                code: {
                    $regex: query.code,
                    $options: 'i'
                },
                organization: context.organization.id
            })
        }
        if (department) {
            return department
        }
    }
    if (query.id) {
        department = await db.department.findById(query.id)
        if (department) {
            return department
        }
    }

    if (query.code) {
        department = await db.department.findOne({
            code: {
                $regex: query.code,
                $options: 'i'
            },
            organization: context.organization.id
        })
        if (department) {
            return department
        }
    }

    if (query.name) {
        department = await db.department.findOne({
            name: {
                $regex: query.name,
                $options: 'i'
            },
            organization: context.organization.id
        })

        if (!department) {
            department = await create({
                name: query.name,
                code: query.code
            }, context)
        }
    }

    return department
}
exports.get = get
exports.create = create
exports.update = update
exports.search = search
