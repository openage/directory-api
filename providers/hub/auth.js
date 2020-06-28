'use strict'
const Client = require('node-rest-client').Client
const client = new Client()
var request = require('request')
const userService = require('../../services/users')
const hubConfig = require('config').get('providers')['hub']

const headerBuilder = (config) => {
    let headers = {
        'Content-type': 'application/x-www-form-urlencoded'
    }
    return headers
}

const getAccessToken = (authCode, config, context) => { // return access token from HUB
    let formData = {
        'client_id': config.client.id,
        'client_secret': config.client.secret,
        'redirect_uri': `${config.redirect_uri}`,
        'grant_type': 'authorization_code',
        'code': authCode
    }

    const hubUrl = `${config.url}/oauth/token`

    context.logger.info(`sending request to url: ${hubUrl}`)

    let options = {
        headers: headerBuilder(),
        form: formData,
        url: hubUrl
    }

    return new Promise((resolve, reject) => {
        return request.post(options, (err, httpResponse, body) => {
            if (err) {
                return reject(err)
            }
            if (httpResponse.statusCode !== 200) {
                return reject(new Error('Incorrect response from HUB'))
            }

            let parsedResponse = JSON.parse(body)

            context.logger.debug(parsedResponse)

            let token = parsedResponse['access_token']
            return resolve(token)
        })
    })
}

const getResourceOwner = (token, config, context) => {
    context.logger.info('getting resource owner start ...')
    const params = {
        'access_token': token
    }

    const hubUrl = `${config.url}/me.json`

    let args = {
        headers: headerBuilder(),
        parameters: params
    }

    context.logger.info(`sending request to url: ${hubUrl}`)

    return new Promise((resolve, reject) => {
        return client.get(hubUrl, args, (data, response) => {
            if (response.statusCode !== 200) {
                return reject(new Error('Incorrect response from HUB'))
            }
            return resolve(data)
        })
    })
}

const getUserFromHubOwner = (hubUser, context) => {
    context.logger.info('auth/hub:getUserFromHubOwner')

    let user = {
        email: hubUser.email,
        profile: {
            firstName: hubUser.first_name,
            lastName: hubUser.last_name
        },
        organization: context.organization,
        tenant: context.tenant
    }

    return userService.getOrCreate(user, context)
}

const userLogout = (config, context) => {
    const url = `${config.url}/users/sign_out`

    const options = {
        headers: headerBuilder(),
        url: url
    }

    context.logger.info(`sending request to url: ${url}`)

    return request.get(options, (err, httpResponse, body) => {
        if (err) {
            throw new Error(err)
        }
        if (httpResponse.statusCode !== 200) {
            throw new Error('Incorrect response from HUB')
        }
        return 'logged out successfully'
    })
}

exports.getRedirectUrl = (context) => {
    let str = `${hubConfig.url}/oauth/authorize?client_id=${hubConfig.client.id}&redirect_uri=${hubConfig.redirect_uri}&response_type=code`
    return str
}

exports.success = async (authCode, context) => {
    if (!authCode) {
        throw new Error(`authCode not found`)
    }
    let token = await getAccessToken(authCode, hubConfig, context)
    let hubUser = await getResourceOwner(token, hubConfig, context)
    let user = await getUserFromHubOwner(hubUser, context)
    if (!user) {
        throw new Error('unable to create or found user')
    }
    return user
}

exports.logout = (context) => {
    userLogout(hubConfig, context).then(() => {
        context.logger.info('successfully logout HUB hub')
        return 'successfully logout'
    }).catch((err) => {
        context.logger.error(err)
        throw new Error(err)
    })
}
