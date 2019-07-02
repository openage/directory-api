const bcrypt = require('bcrypt')

exports.toHash = (value) => {
    return bcrypt.hashSync(value, 10)
}

exports.compareHash = (value, hash) => {
    return bcrypt.compareSync(value, hash)
}

exports.newOTP = () => {
    return Math.floor(Math.random() * 100000) + 100000
}
