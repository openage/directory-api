'use strict'

exports.toModel = (entity) => {
    if (!entity) {
        return null
    }
    let model = {
        firstName: entity.firstName,
        lastName: entity.lastName,
        dob: entity.dob,
        gender: entity.gender
    }

    if (entity.pic) {
        model.pic = {
            url: entity.pic.url,
            thumbnail: entity.pic.thumbnail
        }
    }

    return model
}