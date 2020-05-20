const columnMaps = {
    default: [{
        key: 'code',
        label: 'Roll No'
    },
    {
        key: 'newCode',
        label: 'New Roll No'
    },
    {
        key: 'firstName',
        label: 'First Name'
    },
    {
        key: 'lastName',
        label: 'Last Name'
    },
    {
        key: 'fatherName',
        label: 'Father/Husband Name'
    },
    {
        key: 'bloodGroup',
        label: 'Blood Group'
    },
    {
        key: 'email',
        label: 'Email'
    },
    {
        key: 'phone',
        label: 'Mobile'
    },
    {
        key: 'mentor',
        label: 'Mentor Code'
    },
    {
        key: 'batchCode',
        label: 'Batch Code'
    },
    {
        key: 'batchName',
        label: 'Batch Name'
    },
    {
        key: 'courseCode',
        label: 'Course Code'
    },
    {
        key: 'courseName',
        label: 'Course Name'
    },
    {
        key: 'instituteCode',
        label: 'Institute Code'
    },
    {
        key: 'instituteName',
        label: 'Institute Name'
    },
    {
        key: 'doj',
        label: 'Joining Date',
        type: Date
    },
    {
        key: 'gender',
        label: 'Gender'
    },
    {
        key: 'dob',
        label: 'Birthday',
        type: Date
    },
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
        key: 'pinCode',
        label: 'Pincode'
    },
    {
        key: 'status',
        label: 'Status'
    },
    {
        key: 'dol',
        label: 'Leaving Date',
        type: Date
    },
    {
        key: 'password',
        label: 'Password'
    },
    {
        key: 'picUrl',
        label: 'Picture'

    }]
}

exports.config = async (req, options) => {
    let format = options.format || 'default'

    if (!columnMaps[format]) {
        throw new Error(`'${format}' is not supported`)
    }

    return {
        sheet: 'Students',
        timeZone: req.context.config.timeZone,
        columnMap: columnMaps[format],
        modelMap: (row) => {
            let model = {}
            if (row.email) {
                model.email = row.email
            }
            if (row.phone) {
                model.phone = row.phone
            }

            if (row.code) {
                model.code = row.code
            }

            if (row.password) {
                model.password = row.password
            }

            if (row.newCode) {
                model.newCode = row.newCode
            }

            if (row.newBiometricId) {
                model.config = {
                    biometricCode: row.newBiometricId
                }
            }
            if (row.mentor) {
                model.mentor = {
                    code: row.mentor
                }
            }
            if (row.batchCode) {
                model.batch = {
                    name: row.batchName || row.batchCode,
                    code: row.batchCode
                }
            }
            if (row.courseCode) {
                model.course = {
                    name: row.courseName || row.courseCode,
                    code: row.courseCode
                }
            }

            if (row.instituteCode) {
                model.institute = {
                    name: row.instituteName || row.instituteCode,
                    code: row.instituteCode
                }
            }

            if (row.firstName || row.lastName || row.fatherName || row.dob || row.bloodGroup || row.gender || row.picUrl) {
                model.profile = {
                    firstName: row.firstName,
                    lastName: row.lastName,
                    fatherName: row.fatherName,
                    dob: row.dob,
                    bloodGroup: row.bloodGroup,
                    pic: row.pic || {}
                }

                if (row.gender) {
                    model.profile.gender = row.gender.toLowerCase()
                }

                if (row.picUrl) {
                    model.profile.pic.url = row.picUrl
                }
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

            if (row.guardianName) {
                model.config.guardian = {
                    name: row.guardianName
                }

                if (row.guardianRelation) {
                    model.config.guardian.relation = row.guardianRelation.toLowerCase()
                }
            }

            if (row.status) {
                model.status = row.status
            } else {
                model.status = 'active'
            }

            if (row.doj) {
                model.doj = row.doj
            }

            if (row.dol) {
                model.dol = row.dol
            }

            return model
        },
        headerRow: options.type === 'csv' ? 0 : 0,
        keyCol: 0
    }
}
