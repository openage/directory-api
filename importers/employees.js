const columnMaps = {
    default: [{
        key: 'code',
        label: 'Code'
    },
    {
        key: 'newCode',
        label: 'New Employee Code'
    },
    {
        key: 'biometricId',
        label: 'Biometric Id'
    },
    {
        key: 'shiftType',
        label: 'Shift Type'
    },
    {
        key: 'newBiometricId',
        label: 'New Biometric Id'
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
        label: 'Bloodgroup'
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
        key: 'type',
        label: 'User Type'
    },
    {
        key: 'employmentType',
        label: 'Employment Type'
    },
    {
        key: 'contractorCode',
        label: 'Contractor Code'
    },
    {
        key: 'contractorName',
        label: 'Contractor Name'
    },
    {
        key: 'dom',
        label: 'Membership Date',
        type: Date
    },
    {
        key: 'supervisor',
        label: 'Supervisor Code'
    },
    {
        key: 'designationCode',
        label: 'Designation Code'
    },
    {
        key: 'designationName',
        label: 'Designation Name'
    },
    {
        key: 'departmentCode',
        label: 'Department Code'
    },
    {
        key: 'departmentName',
        label: 'Department Name'
    },
    {
        key: 'divisionCode',
        label: 'Division Code'
    },
    {
        key: 'divisionName',
        label: 'Division Name'
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
        key: 'pf',
        label: 'PF NO'
    },
    {
        key: 'esi',
        label: 'ESI NO'
    },
    {
        key: 'uan',
        label: 'UAN NO'
    },
    {
        key: 'aadhaar',
        label: 'Aadhaar'
    },
    {
        key: 'pan',
        label: 'PAN'
    },
    {
        key: 'accountNo',
        label: 'Account No'
    },
    {
        key: 'accountHolder',
        label: 'Account Holder Name'
    },
    {
        key: 'ifsc',
        label: 'IFSC'
    },
    {
        key: 'bank',
        label: 'Bank'
    },
    {
        key: 'branch',
        label: 'Branch'
    },
    {
        key: 'aadhaar',
        label: 'Aadhaar'
    },
    {
        key: 'nomineeRelation',
        label: 'Nominee Relation'
    },
    {
        key: 'nomineeName',
        label: 'Nominee Name'
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
        key: 'reason',
        label: 'Reason'
    }]
}

exports.config = async (req, options) => {
    let format = options.format || 'default'

    if (!columnMaps[format]) {
        throw new Error(`'${format}' is not supported`)
    }

    return {
        sheet: 'Employees',
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
            // model.biometricCode = row.biometricId
            if (row.code) {
                model.code = row.code
            }

            if (row.reason) {
                model.reason = row.reason
            }
            // model.biometricId = row.biometricId
            if (row.newBiometricId) {
                model.config = {
                    biometricCode: row.newBiometricId
                }
            }
            if (!row.newBiometricId) {
                if (row.supervisor) {
                    model.supervisor = {
                        code: row.supervisor
                    }
                }
                if (row.designationName || row.designationCode) {
                    model.designation = {
                        name: row.designationName || '',
                        code: row.designationCode || ''
                    }
                }
                if (row.departmentName || row.departmentCode) {
                    model.department = {
                        name: row.departmentName || '',
                        code: row.departmentCode || ''
                    }
                }
                if (row.divisionName || row.divisionCode) {
                    model.division = {
                        name: row.divisionName || '',
                        code: row.divisionCode || ''
                    }
                }
                if (row.type) {
                    model.type = row.type.toLowerCase()
                } else {
                    model.type = 'normal'
                }

                if (row.firstName || row.lastName || row.fatherName || row.dob || row.bloodGroup || row.gender || row.pic) {
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

                    model.profile.pic.url = (model.profile.pic && model.profile.pic.url) ? model.profile.pic.url : undefined
                    model.profile.pic.thumbnail = (model.profile.pic && model.profile.pic.thumbnail) ? model.profile.pic.thumbnail : undefined
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

                if (row.biometricId || row.aadhaar || row.accountHolder || row.accountNo || row.bank || row.branch || row.ifsc || row.ifsc || row.pan || row.esi || row.pf || row.uan || row.employmentType || row.shiftType) {
                    model.config = {
                        biometricCode: row.biometricId ? row.biometricId : '',
                        aadhaar: row.aadhaar,
                        accountHolder: row.accountHolder,
                        accountNo: row.accountNo,
                        bank: row.bank,
                        branch: row.branch,
                        ifsc: row.ifsc,
                        pan: row.pan,
                        esi: row.esi,
                        pf: row.pf,
                        uan: row.uan,
                        employmentType: row.employmentType ? row.employmentType.toLowerCase() : '',
                        dom: (row.contractorCode && row.employmentType === 'contract') ? (row.dom || new Date()) : undefined
                    }

                    if (row.employmentType === 'contract' || (row.contractorCode || row.contractorName)) {
                        model.config.contractor = {
                            code: row.contractorCode,
                            name: row.contractorName
                        }
                    }

                    if (row.shiftType) {
                        let shiftTypeCode = row.shiftType.toLowerCase()
                        if (shiftTypeCode === 'auto') {
                            model.config.isDynamicShift = true
                        } else {
                            model.config.shiftType = {
                                code: shiftTypeCode
                            }
                        }
                    }
                }

                if (row.nomineeName) {
                    model.config.nominee = {
                        name: row.nomineeName
                    }

                    if (row.nomineeRelation) {
                        model.config.nominee.relation = row.nomineeRelation.toLowerCase()
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

                // if (!model.email && !model.phone) {
                //     model.email = `${model.code}@${req.context.organization.code}.com`
                // }
            }

            return model
        },
        headerRow: options.type === 'csv' ? 0 : 0,
        keyCol: 0
    }
}
