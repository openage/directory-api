'use strict'
const userService = require('../../services/users');
const axios = require('axios');

exports.success = async (idToken, context) => {
    if (!idToken) {
        throw new Error(`Id token not found`)
    }
    const { data } = await axios({
        url: 'https://graph.facebook.com/me',
        method: 'get',
        params: {
            fields: ['id', 'email', 'first_name', 'last_name'].join(','),
            access_token: idToken,
        },
    });
    if (!data) {
        throw new Error('Data not found')
    }
    let user = await userService.login({
        email: data.email
    }, context)

    if (user) {
        return user
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
