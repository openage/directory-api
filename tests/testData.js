'use strict'
var jsonfile = require('jsonfile')
var appRoot = require('app-root-path')

var paramCase = require('param-case')
// var fs = require('fs');

const getFromFile = (entity, type, name) => {
    return jsonfile.readFileSync(`${appRoot}/tests/data/${paramCase(entity)}/${type}-${paramCase(name)}.json`, {
        reviver: (key, value) => {
            if (typeof value === 'string' && value.indexOf('T') && value.endsWith('Z')) {
                return new Date(value)
            }
            return value
        }
    })
}


const fileDB = (entity) => {
    return {
        list: (name) => {
            return getFromFile(entity, 'list', name)
        },
        obj: (name) => {
            return getFromFile(entity, 'obj', name)
        },
        new: () => {
            return getFromFile(entity, 'obj', 'new')
        }
    }
}

const organization = {
    list: (name) => {
        return getFromFile('organization', 'list', name)
    },
    obj: (name) => {
        return getFromFile('organization', 'obj', name)
    },
    new: () => {
        return {
            _id: '597f2d319f2c5e1cd33ffc7e',
            name: 'Test Organization',
            code: 'test',
            'externalUrl': 'http://ems.mindfulsas.com/api/employees/${id}',
            'activationKey': '84123dc0-5370-11e7-a6e1-1df24bdfb8bc',
            'devicesVersion': '6',
            'devices': [],
            'channels': [],
            'communicationApps': {
                'chat': {
                    'config': {
                        'webhookUrl': 'mdgsdg.slack.com'
                    },
                    'type': {
                        'category': 'chat',
                        'name': 'slack',
                        'providerName': 'slack',
                        'picUrl': 'http://res.cloudinary.com/dkws91cqo/image/upload/v1503475390/slack_bayd8k.png',
                        'description': 'Use Slack to notify supervisor of employee',
                        'parameters': [{
                            'name': 'webhookUrl',
                            'title': 'Webhook Url',
                            'type': 'string',
                            'description': 'Webhook Url to Connect with Slack',
                            'expectedValues': []
                        }]
                    },
                    'status': 'active'
                }
            }
        }
    }
}


exports.employees = fileDB('employees')
exports.roles = fileDB('roles')

exports.context = {
    organization: organization.new()
}
