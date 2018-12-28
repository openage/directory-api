'use strict'

const organizationService = require('../../../services/organizations')
const tenantService = require('../../../services/tenants')
const communications = require('../../../services/communications')

exports.process = async (data, context) => {

    if (!data || !data.id) {
        return
    }

    let organization = await organizationService.getById(data.id, context)

    let tenant = await tenantService.getById(organization.owner.tenant, context)

    if (!organization) {
        return
    }

    return communications.send({
        organization: {
            type: organization.type
        }
    }, 'notify-organization-admin-on-organization-active', [{ roleKey: tenant.owner.key }],
        tenant.owner.key, ['push']
    ).then((communications) => {
        context.logger.info('push delivered')
    })

}