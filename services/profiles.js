exports.get = async (data, defaultProfile, context) => {
    let entity = {}

    let model = {}
    if (data.profile) {
        model = data.profile
    } else if (data.user && data.user.profile) {
        model = data.user.profile
    } else if (defaultProfile) {
        model = defaultProfile
    }

    if (model.firstName) {
        entity.firstName = model.firstName
    }

    if (model.lastName) {
        entity.lastName = model.lastName
    }

    if (model.pic && model.pic.url) {
        entity.pic = {
            url: model.pic.url,
            thumbnail: model.pic.thumbnail
        }
    }

    if (model.dob) {
        entity.dob = model.dob
    }

    if (model.fatherName) {
        entity.fatherName = model.fatherName
    }

    if (model.bloodGroup) {
        entity.bloodGroup = model.bloodGroup
    }

    if (model.gender) {
        entity.gender = model.gender
    }

    return entity
}

exports.generateCode = async (profile) => {
    if (profile.firstName && profile.lastName) {
        return `${profile.firstName}.${profile.lastName}${Math.floor(Math.random() * 10000) + 10000}`
    }

    if (profile.firstName) {
        return `${profile.firstName}${Math.floor(Math.random() * 10000000) + 10000000}`
    }

    return Math.floor(Math.random() * 1000000000) + 1000000000
}
