'use strict'

const extractProfile = (entity) => {
    if (!entity) {
        return null
    }
    let profile = {
        firstName: entity.firstName,
        lastName: entity.lastName,
        dob: entity.dob,
        gender: entity.gender
    }

    if (entity.pic) {
        profile.pic = {
            url: entity.pic.url,
            thumbnail: entity.pic.thumbnail
        }
    }

    return profile
}

exports.toModel = (entity) => {
    let model = {
        id: entity.id,
        email: entity.email,
        phone: entity.phone,
        profile: extractProfile(entity.profile),
        isProfileComplete: entity.isProfileComplete,
        isProfileComplete: entity.isProfileComplete
    }

    return model
}

exports.toSearchModel = (entities) => {
    return entities.map(entity => {
        return exports.toModel(entity)
    })
}