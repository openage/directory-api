/* eslint-disable indent */
'use strict'

const guid = require('guid')

const userService = require('./users')
const instituteService = require('./divisions')
const batchService = require('./batches')
const courseService = require('./courses')

const employeeService = require('./employees')
const userGetter = require('./user-getter')
const profileService = require('./profiles')
const addressService = require('./addresses')

const roleTypeService = require('./role-types')

const dates = require('../helpers/dates')

const db = require('../models')

const offline = require('@open-age/offline-processor')

const populate = 'user course batch institute'

const set = async (model, entity, context) => {
    if (model.doj) {
        entity.doj = model.doj
    }

    if (model.dol && model.dol !== entity.dol) {
        entity.dol = model.dol

        if (dates.date(entity.dol).isPast()) {
            model.status = 'inactive'
        }
    }

    if (model.status && model.status !== entity.status) {
        entity.status = model.status
        if (entity.status === 'inactive') {
            entity.dol = model.dol || new Date()
            entity.reason = model.reason
        }
        if (entity.status === 'active') {
            entity.dol = null
            entity.reason = null
            entity.doj = entity.doj || new Date()
        }
    }

    if (model.phone) {
        entity.phone = model.phone
    }

    if (model.aadhar) {
        entity.aadhar = model.aadhar
    }

    if (model.email) {
        entity.email = model.email.toLowerCase()
    }

    if (model.profile) {
        entity.profile = await profileService.get(model, entity.user.profile, context)
    }

    if (model.address) {
        entity.address = await addressService.get(model, entity.user.address, context)
    }

    if (model.config) {
        entity.config = entity.config || {}
        Object.keys(model.config).forEach(key => {
            entity.config[key] = model.config[key]
        })
        entity.markModified('config')
    }

    if (model.mentor) {
        entity.mentor = await employeeService.get(model.mentor, context)
    }

    if (model.institute) {
        entity.institute = await instituteService.get(model.institute, context)
    }

    if (model.course) {
        entity.course = await courseService.get(model.course, context)
        if (!entity.course) {
            entity.course = await courseService.create(model.course, context)
        }
    }

    if (model.batch) {
        entity.batch = await batchService.get(model.batch, context)

        if (!entity.batch) {
            entity.batch = await batchService.create(model.batch, context)
        }
    }

    if (context.tenant.code === 'aqua') {
        // TODO: this looks wrong
        if (entity.user) {
            entity.user = await userService.update(entity.user.id || {
                student: {
                    code: entity.code
                }
            }, {
                phone: entity.phone,
                email: entity.email,
                profile: entity.profile,
                password: model.password
            }, context)
        }
    }

    return entity
}

const getNewStudentCode = async (options, context) => {
    if (options.course && options.batch) {
        return courseService.getNewStudentCode(options.course, options.batch, options.institute, context)
    }

    const field = 'lastStudentCode'
    let lock = await context.lock(`organization:${context.organization.id}:${field}`)

    let organization = await db.organization.findById(context.organization.id)

    let newCode = (organization[field] || 0) + 1

    organization[field] = newCode

    await organization.save()

    lock.release()

    return `${newCode}`
}

exports.create = async (data, context) => {
    const log = context.logger.start('services/students:create')

    let course = await courseService.get(data.course, context)
    if (!course) {
        course = await courseService.create(data.course, context)
    }

    if (course) {
        data.course = course
    }

    let institute = await instituteService.get(data.institute, context)
    if (!institute) {
        institute = await instituteService.create(data.institute, context)
    }

    if (institute) {
        data.institute = institute
    }

    let batch = await batchService.get(data.batch, context)
    if (!batch) {
        batch = await batchService.create(data.batch, context)
    }

    if (batch) {
        data.batch = batch
    }

    if (data.code) {
        let existingStudent = await this.get(data.code, context)

        if (existingStudent) {
            throw new Error('CODE_EXISTS')
        }
    } else {
        data.code = await getNewStudentCode({
            course: course,
            batch: batch,
            institute: institute
        }, context)
        if (data.code && typeof data.code == 'string') {
            data.code = data.code.replace(/\s+/g, '')
        }
    }

    if (!data.email) {
        if (data.user) {
            data.email = data.user.email
        } else {
            data.email = `${data.code}@${context.organization.code}.com`
        }
    }

    if (!data.phone && data.user) {
        data.phone = data.user.phone
    }

    let user
    if (data.user) {
        user = await userGetter.get(data.user, context)
    }

    if (!user) {
        user = await userGetter.get({
            phone: data.phone,
            email: data.email
        }, context)
    }

    if (!user) {
        user = await userService.create({
            phone: data.phone,
            email: data.email,
            password: data.password,
            profile: await profileService.get(data, null, context),
            address: await addressService.get(data, null, context)
        }, context)
    }

    let entity = await this.get({ user: user }, context)

    if (!entity) {
        entity = new db.student({
            code: data.code,
            phone: data.phone,
            email: data.email,
            prospectNo: data.prospectNo,
            user: user,
            status: data.status || 'new',
            organization: context.organization,
            tenant: context.tenant
        })
    }

    await set(data, entity, context)
    await entity.save()

    let roleType = await roleTypeService.get(`${context.organization.type || 'organization'}.student`, context)

    let role = new db.role({
        key: guid.create().value,
        code: entity.code,
        phone: data.phone,
        email: data.email,
        user: user,
        type: roleType,
        student: entity,
        organization: context.organization,
        tenant: context.tenant
    })

    await role.save()

    entity.role = role

    if (!data.skipHook) {
        await offline.queue('student', 'create', entity, context)
    }

    log.end()
    return entity
}

exports.update = async (id, model, context) => {
    let log = context.logger.start('services/students:update')
    let entity = await this.get(id, context)
    var status = entity.status
    await set(model, entity, context)
    await entity.save()
    await offline.queue('student', 'update', entity, context)

    if (entity.status !== status) {
        await offline.queue('student', entity.status, entity, context)
    }

    log.end()
    return entity
}

exports.search = async (query, paging, context) => {
    context.logger.start('search')

    let sorting = ''
    if (paging && paging.sort) {
        sorting = paging.sort
    }

    let sort = {}

    switch (sorting) {
        default:
            sort['profile.firstName'] = 1
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
        where.$or = [{
            'profile.firstName': {
                '$regex': '^' + query.name,
                $options: 'i'
            }
        }, {
            'profile.lastName': {
                '$regex': '^' + query.name,
                $options: 'i'
            }
        }]
    }

    if (query.fatherName) {
        where['profile.fatherName'] = {
            '$regex': '^' + query.fatherName,
            $options: 'i'
        }
    }

    if (query.code) {
        where['code'] = query.code
    }

    if (query.course) {
        where.course = await courseService.get(query.course, context)
    } else if (query.courses) {
        where.course = {
            $in: query.courses.split(',').map(i => i.toObjectId())
        }
    }

    if (query.batch) {
        where.batch = await batchService.get(query.batch, context)
    } else if (query.batches) {
        where.batch = {
            $in: query.batches.split(',').map(i => i.toObjectId())
        }
    }

    if (query.institute) {
        where.institute = await instituteService.get(query.institute, context)
    } else if (query.institutes) {
        where.institute = {
            $in: query.institutes.split(',').map(i => i.toObjectId())
        }
    }

    if (query.batchmates && context.role.student) {
        where.course = await courseService.get(context.role.student.course, context)
        where.batch = await batchService.get(context.role.student.batch, context)
        where.institute = await instituteService.get(context.role.student.institute, context)
    }

    if (query.mentees && context.role.employee) {
        where.mentor = context.role.employee
    }

    if (query.courses) {
        let courseList = []
        let queryCourseList = query.courses.split(',')
        courseList = queryCourseList.map(item => item.toObjectId())
        where['course'] = {
            $in: courseList
        }
    }
    if (query.batches) {
        let batchList = []
        let queryBatchList = query.batches.split(',')
        batchList = queryBatchList.map(item => item.toObjectId())
        where['batch'] = {
            $in: batchList
        }
    }
    if (query.institutes) {
        let instituteList = []
        let queryInstituteList = query.institutes.split(',')
        instituteList = queryInstituteList.map(item => item.toObjectId())
        where['institute'] = {
            $in: instituteList
        }
    }
    if (query.mentor) {
        where['mentor'] = await employeeService.get(query.mentor, context)
    }

    if (query.timeStamp) {
        where.timeStamp = {
            $gte: Date.parse(query.timeStamp)
        }
    }

    const count = await db.student.find(where).count()
    let items
    if (paging) {
        items = await db.student.find(where).sort(sort).skip(paging.skip).limit(paging.limit).populate(populate)
    } else {
        items = await db.student.find(where).sort(sort).populate(populate)
    }

    return {
        count: count,
        items: items
    }
}

exports.setMentor = async (student, mentor, context) => {
    context.logger.start('service/students:setMentor')
    if (!mentor) {
        return null
    }

    student.supervisor = mentor

    return student.save()
}

exports.get = async (query, context) => {
    let student
    context.logger.debug('service/students:get')
    if (!query) {
        return null
    }

    if (query._bsontype === 'ObjectID') {
        query = {
            id: query.toString()
        }
    }

    if (typeof query === 'string') {
        if (query === 'my') {
            student = await db.student.findById(context.student.id).populate(populate)
        } else if (query.isObjectId()) {
            student = await db.student.findById(query).populate(populate)
        } else {
            student = await db.student.findOne({ organization: context.organization, code: query }).populate(populate)
            if (!student) {
                student = await db.student.findOne({ organization: context.organization, prospectNo: query }).populate(populate)
            }
        }
    } else if (query.id) {
        student = await db.student.findById(query.id).populate(populate)
    } else if (query.code) {
        student = await db.student.findOne({ organization: context.organization, code: query.code }).populate(populate)
    } else if (query.user) {
        student = await db.student.findOne({ organization: context.organization, user: query.user }).populate(populate)
    } else if (query.prospectNo) {
        student = await db.student.findOne({ organization: context.organization, prospectNo: query.prospectNo }).populate(populate)
    }

    return student
}

exports.remove = async (id, context) => {
    context.logger.start('services:students:remove')

    // find role and inactive role

    return this.update(id, {
        status: 'inactive'
    }, context)
}
