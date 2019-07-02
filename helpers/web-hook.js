const client = new (require('node-rest-client-promise')).Client()
var providerConfig = require('config').get('providers')
var appRoot = require('app-root-path')
var fs = require('fs')
var paramCase = require('param-case')

const getMapper = (entity, type, context) => {
    let mapper = null

    if (fs.existsSync(`${appRoot}/mappers/${paramCase(type)}/${entity}.js`)) {
        mapper = require(`${appRoot}/mappers/${paramCase(type)}/${entity}`)
    }

    if (!mapper && fs.existsSync(`${appRoot}/mappers/${entity}.js`)) {
        mapper = require(`${appRoot}/mappers/${entity}`)
    }

    return mapper || {}
}

const fromService = (entity, action, serviceConfig, version) => {
    if (!serviceConfig) {
        return {}
    }

    const retVal = {
        root: serviceConfig.url
    }

    if (serviceConfig.default && version) { // either you have default attribute or its the only config available
        serviceConfig = serviceConfig[version]
    }

    if (!serviceConfig.hooks || !serviceConfig.hooks[entity] || !serviceConfig.hooks[entity][action]) {
        return retVal
    }

    let commonConfig = serviceConfig.hooks.config || {}
    let hookConfig = serviceConfig.hooks[entity][action]
    if (typeof hookConfig === 'string') {
        retVal.url = hookConfig
    } else {
        retVal.url = hookConfig.url
    }

    retVal.action = hookConfig.action || commonConfig.action
    retVal.headers = hookConfig.headers || commonConfig.headers
    retVal.data = hookConfig.data || commonConfig.data

    return retVal
}

const extractConfig = (entity, action, data, tenantService, context) => {
    let serviceCode = tenantService.code
    let serviceVersion = tenantService.version || 'default'

    let tenantLevel = fromService(entity, action, tenantService, serviceVersion)

    let systemLevel = {}
    let orgLevel = {}

    if (serviceCode) {
        systemLevel = fromService(entity, action, providerConfig[serviceCode], serviceVersion)
        if (data.organization && data.organization.services && data.organization.services.length) {
            let orgService = data.organization.services.find(item => item.code === serviceCode)
            if (orgService) {
                orgLevel = fromService(entity, action, orgService, serviceVersion)
            }
        }
    }

    let url = orgLevel.url || tenantLevel.url || systemLevel.url
    let root = orgLevel.root || tenantLevel.root || systemLevel.root

    if (!url) {
        return
    }

    if (url.indexOf('http') !== 0) {
        url = `${root}/${url}`
    }

    let retConfig = {
        url: url,
        action: orgLevel.action || tenantLevel.action || systemLevel.action,
        headers: orgLevel.headers || tenantLevel.headers || systemLevel.headers,
        data: orgLevel.data || tenantLevel.data || systemLevel.data
    }

    return retConfig
}

const send = async (entity, action, data, service, context) => {
    let config = extractConfig(entity, action, data, service, context)
    if (!config) {
        context.logger.debug(`helpers/web-hook.send: no config found`)
        return
    }
    let url = buildUrl(data, config, context)
    let logger = context.logger.start(`helpers/web-hook.send ${url}`)

    const args = {
        headers: buildHeader(data, config, context),
        data: buildPayload(data, entity, service.code, config, context)
    }
    let response = await client.postPromise(url, args)

    let parsedResponse = parseResponse(response, service.code, config, context)

    logger.info('reponse', parsedResponse)
    logger.end()

    return parseResponse
}

const buildUrl = (data, config, context) => {
    return config.url.inject({
        data: data,
        context: context
    })
}

const buildHeader = (data, config, context) => {
    let headers = {}
    Object.keys(config.headers).forEach(key => {
        headers[key] = config.headers[key].inject({
            data: data,
            context: context
        })
    })

    if (context.tenant) {
        headers['x-tenant-code'] = context.tenant.code
    }

    return headers
}

const buildPayload = (data, entity, type, config, context) => {
    if (config.data) {
        return config.data
    }

    let mapper = getMapper(entity, type, context)
    if (mapper.toModel) {
        return mapper.toModel(data, context)
    }

    return data
}

const parseResponse = (response, type, config, context) => {
    if (config.response) {
        return config.response
    }

    if (!config.type) {
        let mapper = getMapper(type, context)
        if (mapper.toResponse) {
            return mapper.toResponse(response)
        }
    }

    if (response) {
        if (response.data && response.data.message) {
            return response.data.message
        }

        if (response.message) {
            return response.message
        }
    }

    return 'success'
}

exports.send = send
