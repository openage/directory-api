'use strict'

const organizationService = require('../../../../services/organizations')
const tenantService = require('../../../../services/tenants')
const communications = require('../../../../services/communications')

exports.process = async (data, context) => {

    if (!data || !data.id) {
        return
    }

    let organization = await organizationService.getById(data.id, context)

    let tenant = await tenantService.getById(organization.owner.tenant, context)

    return communications.send({
        organization: {
            name: organization.name,
            shortName: organization.shortName,
            code: organization.code,
            type: organization.type
        }
    },
        'notify-tenant-admin-on-organization-create', [{ roleKey: organization.owner.key }],
        tenant.owner.key, ['email']
    ).then((communications) => {
        context.logger.info('email delivered')
    })
}