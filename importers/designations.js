const columnMaps = {
    default: [
        { key: 'name', label: 'Name' }
    ]
}

exports.config = async (req, options) => {
    let format = options.format || 'default'

    if (!columnMaps[format]) {
        throw new Error(`'${format}' is not supported`)
    }

    return {
        sheet: 'Designation',
        timeZone: req.context.config.timeZone,
        columnMap: columnMaps[format],
        modelMap: (row) => {
            return row.name ? row : null
        },
        headerRow: 0,
        keyCol: 0
    }
}
