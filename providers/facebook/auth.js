'use strict'
const userService = require('../../services/users')
const userGetter = require('../../services/user-getter')
const axios = require('axios')
const authConfig = require('config').get('auth')
const config = require('config').get('providers')['facebook']

exports.success = async (idToken, context) => {
    if (!idToken) {
        throw new Error(`TOKEN_IS_REQUIRED`)
    }

    let key = config.key

    if (context.tenant.config && context.tenant.config.facebook && context.tenant.config.facebook.key) {
        key = context.tenant.config.facebook.key
    }

    const { data } = await axios({
        url: config.url, // 'https://graph.facebook.com/me',
        method: 'get',
        params: {
            fields: ['id', 'email', 'first_name', 'last_name'].join(','),
            access_token: idToken
        }
    })
    if (!data) {
        throw new Error('TOKEN_INVALID')
    }

    let user = await userGetter.getByEmail(data.email, context)
    if (user) {
        return userService.login({
            email: data.email
        }, context)
    }

    if (!authConfig.autoCreate) {
        throw new Error('USER_DOES_NOT_EXIST')
    }

    return userService.create({
        facebookId: data.id,
        email: data.email,
        profile: {
            firstName: data.first_name,
            lastName: data.last_name
        }
    }, context)
}
