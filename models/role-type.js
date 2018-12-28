'use strict'
var mongoose = require('mongoose')

module.exports = {
    code: String,
    permissions: [{type: String}],
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tenant'
    }
}
