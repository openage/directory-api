'use strict'
const gateway = require('@open-age/gateway-client')
const mapper = require('../../mappers/student')

exports.process = async (entity, context) => {
    gateway.tasks.create({
        template: {
            code: 'directory|student-onboard'
        },
        entity: {
            type: 'student',
            id: entity.code
        },
        meta: {
            student: mapper.toModel(entity, context),
            date: new Date().toISOString(),
            reason: 'New Admission'
        }
    }, context)
}
