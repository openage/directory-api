exports.canCreate = async (req) => {
    if (!req.body.name || !req.body.code) {
        return 'department code and name is needed'
    }

    if (!req.body.division) {
        return 'division is needed'
    }
}
