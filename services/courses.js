'use strict'

const db = require('../models')
const batchService = require('./batches')

let populate = 'institute batches.batch'

const set = async (model, entity, context) => {
    if (model.code && entity.code !== model.code.toLowerCase()) {
        let exists = await db.course.findOne({
            code: model.code.toLowerCase(),
            organization: context.organization
        })

        if (exists) {
            throw new Error(`CODE_EXISTS`)
        }

        entity.code = model.code
    }

    if (model.name) {
        entity.name = model.name
    }

    if (model.level) {
        entity.level = model.level
    }

    if (model.batches) {
        entity.batches = entity.batches || []

        for (const item of model.batches) {
            let batch = await batchService.get(item, context)
            let courseBatch = entity.batches.find(i => i.batch.id === batch.id)

            if (!courseBatch) {
                courseBatch = {
                    batch: batch
                }

                entity.batches.push(courseBatch)
            }

            if (item.lastRollNo) {
                courseBatch.lastRollNo = item.lastRollNo
            }

            if (item.status) {
                courseBatch.status = item.status
            }
        }
    }

    if (model.status) {
        entity.status = model.status
    }

    return entity
}

const getNewCourseCode = async (options, context) => {
    const field = 'lastCourseCode'
    let lock = await context.lock(`organization:${context.organization.id}:${field}`)

    let organization = await db.organization.findById(context.organization.id)

    let newCode = (organization[field] || 0) + 1

    organization[field] = newCode

    await organization.save()

    lock.release()

    return `${newCode}`
}

exports.getNewStudentCode = async (course, batch, institute, context) => {
    let lock = await context.lock(`course:${course.id}:lastRollNo`)

    course = await this.get(course, context)
    course.batches = course.batches || []

    let courseBatch = course.batches.find(i => i.batch.id === batch.id)

    if (!courseBatch) {
        courseBatch = {
            batch: batch,
            lastRollNo: 0,
            status: 'open'
        }

        course.batches.push(courseBatch)
    }

    courseBatch.lastRollNo = (courseBatch.lastRollNo || 0) + 1
    await course.save()
    lock.release()

    return `${batch.code}${institute.code}${course.code}${courseBatch.lastRollNo}`
}

exports.create = async (model, context) => {
    let log = context.logger.start('services/courses:create')
    if (!model.name) {
        throw new Error('name is needed')
    }

    if (!model.code) {
        model.code = await getNewCourseCode({
            name: model.name
        }, context)
    }
    let entity = await db.course.findOne({
        code: model.code.toLowerCase(),
        organization: context.organization
    })

    if (entity) {
        throw new Error('CODE_EXISTS')
    }

    entity = new db.course({
        code: model.code.toLowerCase(),
        name: model.name,
        level: 1,
        status: 'active',
        organization: context.organization,
        tenant: context.tenant
    })

    await set(model, entity, context)
    await entity.save()

    log.end()
    return entity
}

exports.update = async (id, model, context) => {
    let log = context.logger.start('services/courses:update')
    let entity = await db.course.findById(id)

    await set(model, entity, context)
    await entity.save()

    log.end()
    return entity
}

exports.remove = async (id, context) => {
    let log = context.logger.start('services/courses:remove')

    return this.update(id, {
        status: 'inactive'
    }, context)
}

exports.search = async (query, paging, context) => {
    context.logger.start('services/courses:search')
    let sorting = ''
    if (paging && paging.sort) {
        sorting = paging.sort
    }

    let sort = {}

    switch (sorting) {
        default:
            sort['level'] = 1
            break
    }

    query = query || {}

    let where = {
        status: 'active',
        organization: context.organization
    }
    if (query.status) {
        where['status'] = query.status
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
    }

    const count = await db.course.find(where).count()
    let items
    if (paging) {
        items = await db.course.find(where).sort(sort).skip(paging.skip).limit(paging.limit).populate(populate)
    } else {
        items = await db.course.find(where).sort(sort).populate(populate)
    }

    return {
        count: count,
        items: items
    }
}

exports.get = async (query, context) => {
    context.logger.start('get')

    if (!query) {
        query = { code: 'default', name: 'Default' }
    }

    if (query._bsontype === 'ObjectID') {
        query = {
            id: query.toString()
        }
    }

    let where = {
        organization: context.organization
    }

    let id

    if (typeof query === 'string') {
        if (query === 'my') {
            if (context.student && context.student.course) {
                if (context.student.course._doc) {
                    return context.student.course
                } else {
                    id = context.student.course.toString()
                }
            } else {
                return
            }
        } else if (query.isObjectId()) {
            id = query
        } else {
            where.code = query.toLowerCase()
        }
    } else if (query.id) {
        id = query.id
    } else if (query.code) {
        where.code = query.code.toLowerCase()
    } else {
        return
    }

    return (id ? db.course.findById(id) : db.course.findOne(where))
        .populate(populate)
}
