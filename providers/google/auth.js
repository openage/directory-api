'use strict'

const userService = require('../../services/users')
const userGetter = require('../../services/user-getter')
const { OAuth2Client } = require('google-auth-library')
const config = require('config').get('providers')['google']
const authConfig = require('config').get('auth')
const client = new OAuth2Client()

exports.success = async (idToken, context) => {
    if (!idToken) {
        throw new Error(`TOKEN_IS_REQUIRED`)
    }
    let clientIds = (context.tenant.config && context.tenant.config.google && context.tenant.config.google.clientIds) ? context.tenant.config.google.clientIds : config.clientIds

    const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: clientIds
    })

    const googleUser = ticket.getPayload()

    if (!googleUser) {
        throw new Error('TOKEN_INVALID')
    }

    let user = await userGetter.getByEmail(googleUser.email, context)

    if (user) {
        return userService.login({
            email: googleUser.email
        }, context)
    }

    if (!authConfig.autoCreate) {
        throw new Error('USER_DOES_NOT_EXIST')
    }

    await userService.create({
        googleId: googleUser.sub,
        email: googleUser.email,
        profile: {
            firstName: googleUser.given_name,
            lastName: googleUser.family_name,
            pic: {
                url: googleUser.picture
            }
        }
    }, context)
    return userService.login({
        email: googleUser.email
    }, context)
}
