'use strict'

const logger = require('@open-age/logger')('services/communication')
const sendIt = require('../providers/send-it')

exports.send = (data, templateCode, to, from, modes, options) => {
    let log = logger.start('send')

    return sendIt.dispatch(data, templateCode, to, from, modes, options)
        .then((response) => {
            log.debug(response)
            log.info('message pushed')
            return Promise.resolve(response)
        })
        .catch((err) => {
            log.error(err)
            return Promise.reject(err)
        })
}
