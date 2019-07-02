exports.get = async (data, defaultLocation, context) => {
    let location = {}
    if (data.location) {
        location = data.location
    } else if (data.user && data.user.location) {
        location = data.user.location
    } else if (defaultLocation) {
        location = defaultLocation
    }
    return location
}
