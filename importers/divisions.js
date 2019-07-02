const columnMaps = {
    default: [
        { key: 'name', label: 'Name' },
        { key: 'code', label: 'Code' },
        {
            key: 'line1',
            label: 'Address Line 1'
        },
        {
            key: 'line2',
            label: 'Address Line 2'
        },
        {
            key: 'city',
            label: 'City'
        },
        {
            key: 'district',
            label: 'District'
        },
        {
            key: 'state',
            label: 'State'
        },
        {
            key: 'country',
            label: 'Country'
        },
        {
            key: 'pinCode',
            label: 'Pincode'
        }

    ]
}

exports.config = async (req, options) => {
    let format = options.format || 'default'

    if (!columnMaps[format]) {
        throw new Error(`'${format}' is not supported`)
    }

    return {
        sheet: 'Division',
        timeZone: req.context.config.timeZone,
        columnMap: columnMaps[format],
        modelMap: (row) => {
            let model = {}
            if (row.code) {
                model.code = row.code
            }
            if (row.name) {
                model.name = row.name
            }
            if (row.line1 || row.line2 || row.district || row.city || row.state || row.pinCode || row.country) {
                model.address = {
                    line1: row.line1,
                    line2: row.line2,
                    district: row.district,
                    city: row.city,
                    state: row.state,
                    pinCode: row.pinCode,
                    country: row.country
                }
            }
            return model
        },
        headerRow: 0,
        keyCol: 0
    }
}
