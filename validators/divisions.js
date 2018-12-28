exports.canCreate = async (req, callback) => {
    if (!req.body.code || !req.body.name) {
        return 'division code and name is needed'
    }

    return null
}
