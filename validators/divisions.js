exports.canCreate = async (req) => {
    if (!req.body.name) {
        return 'name is required'
    }

    return null
}
