const logger = require('@open-age/logger')('providers/firebase')
const firebase = require('firebase')
const firebaseConfig = require('config').get('firebase')
firebase.initializeApp(firebaseConfig)

exports.create = (model, address, customId) => {
    let log = logger.start(`firebase:${address}:${customId}`)

    if (!address) {
        throw new Error('firebase address required')
    }

    let dbRef = firebase.database().ref(address)

    if (!customId) {
        customId = dbRef.push().key
    }

    dbRef.child(customId).set(model)

    dbRef.once('value').then((snapshot) => {
        log.end()
        log.info(snapshot.val())
    }).catch((error) => {
        log.end()
        log.error(`Failed to create ${address} on firebase:`, error)
    })
}

exports.update = (model, address) => {
    let log = logger.start(`firebase:${address}`)

    let dbRef = firebase.database().ref(address)

    dbRef.update({
        status: model.status,
        user: model.user
    })

    dbRef.once('value').then((snapshot) => {
        log.end()
        logger.info(snapshot.val())
    }).catch((error) => {
        log.end()
        logger.error(`Failed to update ${address} on firebase:`, error)
    })
}
