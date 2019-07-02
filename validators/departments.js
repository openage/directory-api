exports.canCreate = async (req) => {
    if (!req.body.name) {
        return 'name is required'
    }

    // if (!req.body.division) {
    //     return 'division is needed'
    // }
}
