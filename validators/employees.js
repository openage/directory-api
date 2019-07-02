'use strict'
const employees = require('../services/employees')
const fileExtractor = require('../extractors/employees')
const fileUpload = require('../helpers/fileUpload')

exports.canCreate = async (req) => {
    // if (!req.body.phone && !req.body.email) { return 'phone or email is required' }

    if (!req.body.type) {
        return 'employee type required'
    }

    if (req.body.code) {
        let sameCodeEmp = await employees.getByCode(req.body.code, req.context)

        if (sameCodeEmp) {
            return `employee with code '${req.body.code}' exists`
        }
    }

    if (!req.context.organization) {
        return 'invalid role to create employee'
    }

    // if (!req.context.hasPermission('admin')) {
    //     return 'you do not have sufficient privileges'
    // }
}

exports.canBulkUpload = async (req) => {
    let files = await fileUpload.withFileForm(req)

    if (!files.file) { return 'file not found' }

    let data = await fileExtractor.extract(files.file, req.context)

    let employeesData = []

    data.forEach(item => {
        if (item.Name) {
            let retVal = item.Name.split(' ')
            item.FirstName = retVal[0]
            item.LastName = retVal[1]
        }

        employeesData.push(item)
    })

    req.data = employeesData
}

exports.canSearch = async (req) => {
    if (!req.context.organization) {
        return 'permissions not found'
    }
}
