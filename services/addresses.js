exports.get = async (data, defaultAddress, context) => {
    let address = {}
    if (data.address) {
        address = data.address
    } else if (data.user && data.user.address) {
        address = data.user.address
    } else if (defaultAddress) {
        address = defaultAddress
    }
    return address
}
