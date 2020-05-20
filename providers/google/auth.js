'use strict'

const userService = require('../../services/users')
const { OAuth2Client } = require('google-auth-library')
const config = require('config').get('providers')['google']
const client = new OAuth2Client()

exports.success = async (idToken, context) => {
    if (!idToken) {
        throw new Error(`idToken not found`)
    }
    let clientIds = config.clientIds

    const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: clientIds
    })

    // if (!ticket.isSuccess) {
    //     throw new Error(ticket.message)
    // }
    const googleUser = ticket.getPayload()

    let user = await userService.login({
        email: googleUser.email
    }, context)

    if (user) {
        return user
    }

    return userService.create({
        googleId: googleUser.sub,
        email: googleUser.email,
        profile: {
            firstName: googleUser.given_name,
            lastName: googleUser.family_name
        }
    }, context)
}
