
export const timelineService = {
    query,
    remove,
    toggleConfirm,
    getGroundings,
    updateFieldValue,
    undoEdit,
    addEntry,
    getAsCSV,
    getDocs,
    addGrounding,
    validateData,
    getValidationRules
}

const DOC_TYPES = {
    ENGINE_DELIVERY_DOC: 'engineDeliveryDoc',
    OP_ON_OFF_LOG: 'opOnOffLog',
    PART_REMOVAL_TAG: 'partRemovalTag'
}

const cellState = {
    draft: 'draft',
    confirmed: 'confirmed'
}

const docs = [
    {
        id: 'doc1',
        types: [DOC_TYPES.ENGINE_DELIVERY_DOC],
        description: "Engine delivery documentation",
        date: '21-Jun-2020',
        issuer: {
            type: 'Operator',
            name: 'ACME Engines',
        },
        esns: ['ENG123456', 'ENG654321'],
        url: './pdf/doc1.pdf',
        pagesCount: 3
    },
    {
        id: 'doc2',
        types: [DOC_TYPES.OP_ON_OFF_LOG, DOC_TYPES.ENGINE_DELIVERY_DOC],
        description: "Operation on/off log with engine delivery details",
        date: '21-Jun-2020',
        issuer: {
            type: 'Operator',
            name: 'ACME Engines',
        },
        esns: [],
        url: './pdf/doc2.pdf',
        pagesCount: 3
    },
    {
        id: 'doc3',
        types: [DOC_TYPES.PART_REMOVAL_TAG],
        description: "Part removal tag documentation",
        date: '16-Aug-2021',
        issuer: {
            type: 'Shop',
            name: 'Best Repairs Ltd.',
        },
        esns: [],
        url: './pdf/doc3.pdf',
        pagesCount: 3
    },
    {
        id: 'doc4',
        types: [DOC_TYPES.ENGINE_DELIVERY_DOC, DOC_TYPES.PART_REMOVAL_TAG],
        description: "Engine delivery documentation with part removal tag",
        date: '11-Feb-2022',
        issuer: {
            type: 'OEM',
            name: 'Global Engines Inc.',
        },
        esns: ['ENG123456'],
        url: './pdf/doc4.pdf',
        pagesCount: 3
    },
    {
        id: 'doc5',
        types: [DOC_TYPES.OP_ON_OFF_LOG],
        description: "Operation on/off log",
        date: '14-Mar-2023',
        issuer: {
            type: 'OEM',
            name: 'Global Engines Inc.',
        },
        esns: ['ENG123456'],
        url: './pdf/doc5.pdf',
        pagesCount: 3
    }
]


const demoData = _createDemoData()

async function query() {
    return demoData
}


function getGroundings(entryId, fieldPath) {
    const entry = demoData.find(entry => entry.id === entryId)
    if (!entry) return []
    const fieldPaths = fieldPath.split('.')
    let field = entry
    for (const path of fieldPaths) {
        field = field[path]
        if (!field) return []
    }
    if (!field.groundings) return []

    // Map cFileId to actual URL
    const groundingsWithUrls = field.groundings.map(grounding => {
        const doc = getDocById(grounding.docId)

        return {
            ...grounding,
            doc: {
                name: doc.description,
                url: doc.url
            }
        }
    })

    return groundingsWithUrls
}

function addGrounding(entryId, fieldPath, docId, pageNum = 1) {
    const entry = demoData.find(entry => entry.id === entryId)
    if (!entry) return false

    const fieldPaths = fieldPath.split('.')
    let field = entry
    for (const path of fieldPaths) {
        field = field[path]
        if (!field) return false
    }

    // Initialize groundings array if it doesn't exist
    if (!field.groundings) {
        field.groundings = []
    }

    // Check if this document is already a grounding
    const existingGrounding = field.groundings.find(g => g.docId === docId)
    if (existingGrounding) {
        console.log('Document already exists as grounding')
        return false
    }

    // Create a new grounding with default coordinates
    const newGrounding = _createGrounding({
        cFileId: `cfile-${docId}`,
        pageNum: pageNum,
        docId: docId,
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0
    })

    // Add the grounding
    field.groundings.push(newGrounding)

    return true
}

function remove(entryId) {
    const entryIdx = demoData.findIndex(entry => entry.id === entryId)
    if (entryIdx === -1) return false
    demoData.splice(entryIdx, 1)
    return true
}

function addEntry(entryData, afterEntryId) {
    const newEntry = _createEntry(entryData)

    if (afterEntryId) {
        // Find the index of the entry to insert after
        const afterIndex = demoData.findIndex(entry => entry.id === afterEntryId)
        if (afterIndex !== -1) {
            // Insert right after the found entry
            demoData.splice(afterIndex + 1, 0, newEntry)
        } else {
            // If not found, add at the end
            demoData.push(newEntry)
        }
    } else {
        // No reference entry, add at the end
        demoData.push(newEntry)
    }

    return newEntry
}

function getAsCSV() {
    // Define CSV headers
    const headers = [
        'ID',
        'Operator',
        'Date Range Start',
        'Date Range End',
        'ESN',
        'Engine Total Cycle Start',
        'Engine Total Cycle End',
        'Engine Total Hour Start',
        'Engine Total Hour End',
        'Part Total Cycle Start',
        'Part Total Cycle End',
        'Part Total Hour Start',
        'Part Total Hour End',
        'Part Hours (Op)',
        'Part Cycles (Op)'
    ]

    // Build CSV rows
    const rows = demoData.map(entry => {
        return [
            entry.id,
            entry.op.value,
            entry.dateRange.start.value,
            entry.dateRange.end.value,
            entry.engine.esn.value,
            entry.engine.totalCycleRange.start.value,
            entry.engine.totalCycleRange.end.value,
            entry.engine.totalHourRange.start.value,
            entry.engine.totalHourRange.end.value,
            entry.part.totalCycleRange.start.value,
            entry.part.totalCycleRange.end.value,
            entry.part.totalHourRange.start.value,
            entry.part.totalHourRange.end.value,
            entry.part.hours.value,
            entry.part.cycles.value
        ].map(value => {
            // Escape values that contain commas, quotes, or newlines
            const stringValue = String(value)
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                return `"${stringValue.replace(/"/g, '""')}"`
            }
            return stringValue
        }).join(',')
    })

    // Combine headers and rows
    return [headers.join(','), ...rows].join('\n')
}

function toggleConfirm(entryId, fieldPath) {
    const entry = demoData.find(entry => entry.id === entryId)
    if (!entry) return false
    if (!fieldPath) return false
    const fieldPaths = fieldPath.split('.')
    let field = entry
    for (const path of fieldPaths) {
        field = field[path]
        if (!field) return false
    }
    // Toggle between draft and confirmed
    field.state = field.state === cellState.confirmed ? cellState.draft : cellState.confirmed
    return true
}

function updateFieldValue(entryId, fieldPath, newValue) {
    const entry = demoData.find(entry => entry.id === entryId)
    if (!entry) return false
    if (!fieldPath) return false

    const fieldPaths = fieldPath.split('.')
    let field = entry

    // Navigate to the parent of the target field
    for (let i = 0; i < fieldPaths.length - 1; i++) {
        field = field[fieldPaths[i]]
        if (!field) return false
    }

    // Get the last property name
    const lastProperty = fieldPaths[fieldPaths.length - 1]

    // Update the value property if it exists (for nested objects with value/state)
    if (field[lastProperty]) {
        const oldValue = field[lastProperty].value

        // Only update if value actually changed
        if (oldValue === newValue) return false

        field[lastProperty].edits.push(
            _createEdit({ from: oldValue, to: newValue })
        )

        // Update the value
        field[lastProperty].value = newValue

        // Reset state to draft after edit
        if (field[lastProperty].state === cellState.confirmed) {
            field[lastProperty].state = cellState.draft
        }
    } else {
        // Direct property update
        field[lastProperty] = newValue
    }

    return true
}

function undoEdit(entryId, fieldPath, editIndex) {
    const entry = demoData.find(entry => entry.id === entryId)
    if (!entry) return false
    if (!fieldPath) return false

    const fieldPaths = fieldPath.split('.')
    let field = entry

    // Navigate to the target field
    for (let i = 0; i < fieldPaths.length; i++) {
        field = field[fieldPaths[i]]
        if (!field) return false
    }

    // Check if field has edits
    if (!field.edits || field.edits.length === 0 || editIndex >= field.edits.length) {
        return false
    }

    // Get the edit to undo
    const editToUndo = field.edits[editIndex]

    // Restore the old value
    field.value = editToUndo.from

    // Remove all edits from this index onwards (undoing this and later edits)
    field.edits.splice(editIndex)

    // If no more edits and was confirmed, restore confirmed state
    // Otherwise keep as draft
    if (field.edits.length === 0 && field.state === cellState.draft) {
        // Optionally restore to confirmed if this was the only edit
        // field.state = cellState.confirmed
    }

    return true
}

function _createGrounding({ cFileId, pageNum, docId, x1, y1, x2, y2 }) {
    return {
        cFileId,
        pageNum,
        docId,
        x1: x1 || 0,
        y1: y1 || 0,
        x2: x2 || 0,
        y2: y2 || 0
    }
}

function _createEdit({ at, by, from, to }) {
    return {
        at: at || new Date().toISOString(),
        by: by || 'user1',
        from,
        to
    }
}

function _createEntry({
    id,
    op,
    dateRangeStart,
    dateRangeEnd,
    esn,
    engineTotalCycleStart,
    engineTotalCycleEnd,
    engineTotalHourStart,
    engineTotalHourEnd,
    partTotalCycleStart,
    partTotalCycleEnd,
    partTotalHourStart,
    partTotalHourEnd
}) {
    // Calculate part hours and cycles, only if we have valid end values
    const partHours = (partTotalHourEnd && partTotalHourStart) ? partTotalHourEnd - partTotalHourStart : '';
    const partCycles = (partTotalCycleEnd && partTotalCycleStart) ? partTotalCycleEnd - partTotalCycleStart : '';

    return {
        id: id || `entry-${Date.now()}`,
        dateRange: {
            start: {
                value: dateRangeStart || '',
                state: cellState.draft,
                edits: [],
                groundings: []
            },
            end: {
                value: dateRangeEnd || '',
                state: cellState.draft,
                edits: [],
                groundings: []
            }
        },
        engine: {
            esn: {
                value: esn || '',
                state: cellState.draft,
                edits: [],
                groundings: []
            },
            totalHourRange: {
                start: {
                    value: engineTotalHourStart ?? '',
                    state: cellState.draft,
                    edits: [],
                    groundings: []
                },
                end: {
                    value: engineTotalHourEnd ?? '',
                    state: cellState.draft,
                    edits: [],
                    groundings: []
                }
            },
            totalCycleRange: {
                start: {
                    value: engineTotalCycleStart ?? '',
                    state: cellState.draft,
                    edits: [],
                    groundings: []
                },
                end: {
                    value: engineTotalCycleEnd ?? '',
                    state: cellState.draft,
                    edits: [],
                    groundings: []
                }
            }
        },
        part: {
            hours: {
                value: partHours > 0 ? partHours : '',
                state: cellState.draft,
                edits: []
            },
            cycles: {
                value: partCycles > 0 ? partCycles : '',
                state: cellState.draft,
                edits: []
            },
            totalHourRange: {
                start: {
                    value: partTotalHourStart ?? '',
                    state: cellState.draft,
                    edits: [],
                    groundings: []
                },
                end: {
                    value: partTotalHourEnd ?? '',
                    state: cellState.draft,
                    edits: [],
                    groundings: []
                }
            },
            totalCycleRange: {
                start: {
                    value: partTotalCycleStart ?? '',
                    state: cellState.draft,
                    edits: [],
                    groundings: []
                },
                end: {
                    value: partTotalCycleEnd ?? '',
                    state: cellState.draft,
                    edits: [],
                    groundings: []
                }
            }
        },
        op: {
            id: `op-${id || Date.now()}`,
            value: op || '',
            state: cellState.draft,
            edits: [],
            groundings: []
        }
    }
}


function getDocById(docId) {
    return docs.find(doc => doc.id === docId) || null
}

function getDocs(entryId, fieldPath) {
    // Return all documents available
    return docs
}

function _createDemoData() {
    const demoData =
        [
            _createEntry({
                id: 'entry-101',
                op: 'LTU',
                dateRangeStart: '13-Jul-2005',
                dateRangeEnd: '25-Oct-2006',
                esn: '577351',
                engineTotalCycleStart: 0,
                engineTotalCycleEnd: 540,
                engineTotalHourStart: 0,
                engineTotalHourEnd: 1322,
                partTotalCycleStart: 0,
                partTotalCycleEnd: 540,
                partTotalHourStart: 0,
                partTotalHourEnd: 1322
            }),
            _createEntry({
                id: 'entry-102',
                op: 'AIR BERLIN',
                dateRangeStart: '25-Dec-2006',
                dateRangeEnd: '5-Dec-2012',
                esn: '577351',
                engineTotalCycleStart: 540,
                engineTotalCycleEnd: 10125,
                engineTotalHourStart: 1322,
                engineTotalHourEnd: 19004,
                partTotalCycleStart: 540,
                partTotalCycleEnd: 10125,
                partTotalHourStart: 1322,
                partTotalHourEnd: 19004
            })
        ]

    demoData[0].dateRange.start.groundings = [
        _createGrounding({ cFileId: 'cfile-101', pageNum: 2, docId: 'doc1', x1: 145, y1: 498, x2: 255, y2: 523 }),
        _createGrounding({ cFileId: 'cfile-101', pageNum: 1, docId: 'doc2', x1: 145, y1: 498, x2: 255, y2: 523 }),
        _createGrounding({ cFileId: 'cfile-101', pageNum: 2, docId: 'doc2', x1: 145, y1: 498, x2: 255, y2: 523 })
    ]
    demoData[0].dateRange.end.groundings = [
        _createGrounding({ cFileId: 'cfile-101', pageNum: 2, docId: 'doc1', x1: 140, y1: 465, x2: 255, y2: 490 })
    ]
    demoData[0].engine.esn.groundings = [
        _createGrounding({ cFileId: 'cfile-101', pageNum: 2, docId: 'doc1', x1: 132, y1: 595, x2: 198, y2: 620 })
    ]
    demoData[0].engine.esn.edits = [
        _createEdit({ at: '2025-06-10T11:00:00Z', by: 'user1', from: '577352', to: '577351' }),
        _createEdit({ at: '2025-06-10T10:00:00Z', by: 'user2', from: '577357', to: '577352' })
    ]
    demoData[0].engine.totalHourRange.end.groundings = [
        _createGrounding({ cFileId: 'cfile-101', pageNum: 2, docId: 'doc1', x1: 135, y1: 370, x2: 185, y2: 395 })
    ]
    demoData[0].engine.totalCycleRange.end.groundings = [
        _createGrounding({ cFileId: 'cfile-101', pageNum: 2, docId: 'doc1', x1: 140, y1: 335, x2: 180, y2: 360 })
    ]
    demoData[0].part.totalHourRange.end.groundings = [
        _createGrounding({ cFileId: 'cfile-101', pageNum: 2, docId: 'doc1', x1: 135, y1: 370, x2: 185, y2: 395 })
    ]
    demoData[0].part.totalCycleRange.end.groundings = [
        _createGrounding({ cFileId: 'cfile-101', pageNum: 2, docId: 'doc1', x1: 140, y1: 335, x2: 180, y2: 360 })
    ]
    demoData[0].op.groundings = [
        _createGrounding({ cFileId: 'cfile-101', pageNum: 2, docId: 'doc1', x1: 280, y1: 745, x2: 325, y2: 770 })
    ]

    demoData[1].dateRange.start.groundings = [
        _createGrounding({ cFileId: 'cfile-101', pageNum: 3, docId: 'doc1', x1: 145, y1: 498, x2: 265, y2: 523 })
    ]
    demoData[1].dateRange.end.groundings = [
        _createGrounding({ cFileId: 'cfile-101', pageNum: 3, docId: 'doc1', x1: 140, y1: 465, x2: 255, y2: 490 })
    ]
    demoData[1].engine.esn.groundings = [
        _createGrounding({ cFileId: 'cfile-101', pageNum: 3, docId: 'doc1', x1: 132, y1: 595, x2: 198, y2: 620 })
    ]
    demoData[1].engine.totalHourRange.end.groundings = [
        _createGrounding({ cFileId: 'cfile-101', pageNum: 2, docId: 'doc1', x1: 135, y1: 370, x2: 185, y2: 395 }),
        _createGrounding({ cFileId: 'cfile-101', pageNum: 3, docId: 'doc1', x1: 135, y1: 370, x2: 195, y2: 395 })
    ]
    demoData[1].engine.totalCycleRange.end.groundings = [
        _createGrounding({ cFileId: 'cfile-101', pageNum: 2, docId: 'doc1', x1: 70, y1: 400, x2: 220, y2: 425 }),
        _createGrounding({ cFileId: 'cfile-101', pageNum: 2, docId: 'doc1', x1: 140, y1: 335, x2: 180, y2: 360 }),
        _createGrounding({ cFileId: 'cfile-101', pageNum: 3, docId: 'doc1', x1: 140, y1: 335, x2: 192, y2: 360 })
    ]
    demoData[1].part.totalHourRange.end.groundings = [
        _createGrounding({ cFileId: 'cfile-101', pageNum: 3, docId: 'doc1', x1: 135, y1: 370, x2: 195, y2: 395 })
    ]
    demoData[1].part.totalCycleRange.end.groundings = [
        _createGrounding({ cFileId: 'cfile-101', pageNum: 3, docId: 'doc1', x1: 140, y1: 335, x2: 202, y2: 360 })
    ]
    demoData[1].op.groundings = [
        _createGrounding({ cFileId: 'cfile-101', pageNum: 3, docId: 'doc1', x1: 280, y1: 745, x2: 400, y2: 770 })
    ]


    return demoData
}

window.demoData = demoData // For debugging purposes

function getValidationRules() {
    return validationRules
}

function validateData() {
    const validationErrors = {}
    
    // Helper to add error to a specific entry/field
    const addError = (entryId, fieldPath, error) => {
        if (!validationErrors[entryId]) {
            validationErrors[entryId] = {}
        }
        if (!validationErrors[entryId][fieldPath]) {
            validationErrors[entryId][fieldPath] = []
        }
        validationErrors[entryId][fieldPath].push(error)
    }
    
    // Helper to get field value
    const getFieldValue = (entry, fieldPath) => {
        const parts = fieldPath.split('.')
        let value = entry
        for (const part of parts) {
            value = value?.[part]
            if (value === undefined) return undefined
        }
        return value?.value !== undefined ? value.value : value
    }
    
    // Helper to check if value is empty
    const isEmpty = (value) => {
        return value === '' || value === null || value === undefined
    }
    
    // Helper to parse date in DD-MMM-YYYY format
    const parseDate = (dateStr) => {
        if (!dateStr || typeof dateStr !== 'string') return null
        const months = {
            'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
            'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
        }
        const parts = dateStr.split('-')
        if (parts.length !== 3) return null
        const day = parseInt(parts[0])
        const month = months[parts[1]]
        const year = parseInt(parts[2])
        if (isNaN(day) || month === undefined || isNaN(year)) return null
        return new Date(year, month, day)
    }
    
    // Sort entries by end date to ensure proper order checking
    const sortedEntries = [...demoData].sort((a, b) => {
        const dateA = parseDate(getFieldValue(a, 'dateRange.end'))
        const dateB = parseDate(getFieldValue(b, 'dateRange.end'))
        if (!dateA && !dateB) return 0
        if (!dateA) return 1
        if (!dateB) return -1
        return dateA - dateB
    })
    
    // IOP01: Operational Period value is missing
    sortedEntries.forEach((entry, index) => {
        // An entry is only considered "final period" if it's the last one AND has a valid end date
        // Empty end dates indicate incomplete entries that should be validated
        const hasEndDate = !isEmpty(getFieldValue(entry, 'dateRange.end'))
        const isFinalPeriod = index === sortedEntries.length - 1 && hasEndDate
        
        const requiredFields = [
            'engine.esn',
            'op',
            'dateRange.start',
            'engine.totalCycleRange.start',
            'engine.totalHourRange.start',
            'part.totalCycleRange.start',
            'part.totalHourRange.start'
        ]
        
        if (!isFinalPeriod) {
            requiredFields.push(
                'dateRange.end',
                'engine.totalCycleRange.end',
                'engine.totalHourRange.end',
                'part.totalCycleRange.end',
                'part.totalHourRange.end'
            )
        }
        
        requiredFields.forEach(fieldPath => {
            const value = getFieldValue(entry, fieldPath)
            if (isEmpty(value)) {
                addError(entry.id, fieldPath, {
                    code: 'IOP01',
                    severity: 1,
                    error: 'Operational Period value is missing',
                    description: 'Ensure the following fields have values'
                })
            }
        })
    })
    
    // IOP02: Operational period end date must not precede start date
    sortedEntries.forEach(entry => {
        const startDate = parseDate(getFieldValue(entry, 'dateRange.start'))
        const endDate = parseDate(getFieldValue(entry, 'dateRange.end'))
        
        if (startDate && endDate && endDate < startDate) {
            addError(entry.id, 'dateRange.end', {
                code: 'IOP02',
                severity: 1,
                error: 'Operational period end date must not precede start date',
                description: 'End date cannot be before start date'
            })
            addError(entry.id, 'dateRange.start', {
                code: 'IOP02',
                severity: 1,
                error: 'Operational period end date must not precede start date',
                description: 'End date cannot be before start date'
            })
        }
    })
    
    // IOP03: Operational period end value must not be smaller than the start value
    sortedEntries.forEach(entry => {
        const fields = [
            { start: 'engine.totalCycleRange.start', end: 'engine.totalCycleRange.end', name: 'Engine CSN' },
            { start: 'engine.totalHourRange.start', end: 'engine.totalHourRange.end', name: 'Engine TSN' },
            { start: 'part.totalCycleRange.start', end: 'part.totalCycleRange.end', name: 'LLP CSN' },
            { start: 'part.totalHourRange.start', end: 'part.totalHourRange.end', name: 'LLP TSN' }
        ]
        
        fields.forEach(field => {
            const startVal = getFieldValue(entry, field.start)
            const endVal = getFieldValue(entry, field.end)
            
            if (!isEmpty(startVal) && !isEmpty(endVal) && endVal < startVal) {
                addError(entry.id, field.end, {
                    code: 'IOP03',
                    severity: 1,
                    error: `${field.name} end value must not be smaller than start value`,
                    description: `End value (${endVal}) cannot be less than start value (${startVal})`
                })
            }
        })
    })
    
    // IOP04: Operational period end value must be larger than the start value
    sortedEntries.forEach(entry => {
        const fields = [
            { start: 'engine.totalCycleRange.start', end: 'engine.totalCycleRange.end', name: 'Engine CSN' },
            { start: 'engine.totalHourRange.start', end: 'engine.totalHourRange.end', name: 'Engine TSN' },
            { start: 'part.totalCycleRange.start', end: 'part.totalCycleRange.end', name: 'LLP CSN' },
            { start: 'part.totalHourRange.start', end: 'part.totalHourRange.end', name: 'LLP TSN' }
        ]
        
        fields.forEach(field => {
            const startVal = getFieldValue(entry, field.start)
            const endVal = getFieldValue(entry, field.end)
            
            if (!isEmpty(startVal) && !isEmpty(endVal) && endVal === startVal) {
                addError(entry.id, field.end, {
                    code: 'IOP04',
                    severity: 1,
                    error: `${field.name} end value must be larger than start value`,
                    description: `End value (${endVal}) must be greater than start value (${startVal})`
                })
            }
        })
    })
    
    // IOP05: Increase in LLP CSN must equal increase in Engine CSN
    sortedEntries.forEach(entry => {
        const engineStart = getFieldValue(entry, 'engine.totalCycleRange.start')
        const engineEnd = getFieldValue(entry, 'engine.totalCycleRange.end')
        const llpStart = getFieldValue(entry, 'part.totalCycleRange.start')
        const llpEnd = getFieldValue(entry, 'part.totalCycleRange.end')
        
        if (!isEmpty(engineStart) && !isEmpty(engineEnd) && !isEmpty(llpStart) && !isEmpty(llpEnd)) {
            const engineIncrease = engineEnd - engineStart
            const llpIncrease = llpEnd - llpStart
            
            if (engineIncrease !== llpIncrease) {
                addError(entry.id, 'part.totalCycleRange.end', {
                    code: 'IOP05',
                    severity: 1,
                    error: 'Increase in LLP CSN must equal increase in Engine CSN',
                    description: `LLP increase (${llpIncrease}) must equal Engine increase (${engineIncrease})`
                })
                addError(entry.id, 'engine.totalCycleRange.end', {
                    code: 'IOP05',
                    severity: 1,
                    error: 'Increase in LLP CSN must equal increase in Engine CSN',
                    description: `LLP increase (${llpIncrease}) must equal Engine increase (${engineIncrease})`
                })
            }
        }
    })
    
    // IOP06: Increase in LLP TSN must equal increase in Engine TSN
    sortedEntries.forEach(entry => {
        const engineStart = getFieldValue(entry, 'engine.totalHourRange.start')
        const engineEnd = getFieldValue(entry, 'engine.totalHourRange.end')
        const llpStart = getFieldValue(entry, 'part.totalHourRange.start')
        const llpEnd = getFieldValue(entry, 'part.totalHourRange.end')
        
        if (!isEmpty(engineStart) && !isEmpty(engineEnd) && !isEmpty(llpStart) && !isEmpty(llpEnd)) {
            const engineIncrease = engineEnd - engineStart
            const llpIncrease = llpEnd - llpStart
            
            if (engineIncrease !== llpIncrease) {
                addError(entry.id, 'part.totalHourRange.end', {
                    code: 'IOP06',
                    severity: 1,
                    error: 'Increase in LLP TSN must equal increase in Engine TSN',
                    description: `LLP increase (${llpIncrease}) must equal Engine increase (${engineIncrease})`
                })
                addError(entry.id, 'engine.totalHourRange.end', {
                    code: 'IOP06',
                    severity: 1,
                    error: 'Increase in LLP TSN must equal increase in Engine TSN',
                    description: `LLP increase (${llpIncrease}) must equal Engine increase (${engineIncrease})`
                })
            }
        }
    })
    
    // IOP07: If the LLP CSN increased the TSN must increase as well
    sortedEntries.forEach(entry => {
        const llpCsnStart = getFieldValue(entry, 'part.totalCycleRange.start')
        const llpCsnEnd = getFieldValue(entry, 'part.totalCycleRange.end')
        const llpTsnStart = getFieldValue(entry, 'part.totalHourRange.start')
        const llpTsnEnd = getFieldValue(entry, 'part.totalHourRange.end')
        
        if (!isEmpty(llpCsnStart) && !isEmpty(llpCsnEnd) && !isEmpty(llpTsnStart) && !isEmpty(llpTsnEnd)) {
            const csnIncrease = llpCsnEnd - llpCsnStart
            const tsnIncrease = llpTsnEnd - llpTsnStart
            
            if (csnIncrease > 0 && tsnIncrease <= 0) {
                addError(entry.id, 'part.totalHourRange.end', {
                    code: 'IOP07',
                    severity: 1,
                    error: 'If the LLP CSN increased the TSN must increase as well',
                    description: `LLP CSN increased by ${csnIncrease} but TSN did not increase`
                })
            }
        }
    })
    
    // IOP08: If the Engine CSN increased the TSN must increase as well
    sortedEntries.forEach(entry => {
        const engineCsnStart = getFieldValue(entry, 'engine.totalCycleRange.start')
        const engineCsnEnd = getFieldValue(entry, 'engine.totalCycleRange.end')
        const engineTsnStart = getFieldValue(entry, 'engine.totalHourRange.start')
        const engineTsnEnd = getFieldValue(entry, 'engine.totalHourRange.end')
        
        if (!isEmpty(engineCsnStart) && !isEmpty(engineCsnEnd) && !isEmpty(engineTsnStart) && !isEmpty(engineTsnEnd)) {
            const csnIncrease = engineCsnEnd - engineCsnStart
            const tsnIncrease = engineTsnEnd - engineTsnStart
            
            if (csnIncrease > 0 && tsnIncrease <= 0) {
                addError(entry.id, 'engine.totalHourRange.end', {
                    code: 'IOP08',
                    severity: 1,
                    error: 'If the Engine CSN increased the TSN must increase as well',
                    description: `Engine CSN increased by ${csnIncrease} but TSN did not increase`
                })
            }
        }
    })
    
    // EOP03: Operational Period start values should equal previous birth/period end values
    for (let i = 1; i < sortedEntries.length; i++) {
        const currentEntry = sortedEntries[i]
        const previousEntry = sortedEntries[i - 1]
        
        const fields = [
            { current: 'part.totalCycleRange.start', previous: 'part.totalCycleRange.end', name: 'LLP CSN' },
            { current: 'part.totalHourRange.start', previous: 'part.totalHourRange.end', name: 'LLP TSN' }
        ]
        
        fields.forEach(field => {
            const currentVal = getFieldValue(currentEntry, field.current)
            const previousVal = getFieldValue(previousEntry, field.previous)
            
            if (!isEmpty(currentVal) && !isEmpty(previousVal) && currentVal !== previousVal) {
                addError(currentEntry.id, field.current, {
                    code: 'EOP03',
                    severity: 1,
                    error: 'Operational Period start values should equal previous period end values',
                    description: `${field.name} start (${currentVal}) should equal previous end (${previousVal})`
                })
            }
        })
        
        // Also check Engine CSN/TSN
        const currentEsn = getFieldValue(currentEntry, 'engine.esn')
        const previousEsn = getFieldValue(previousEntry, 'engine.esn')
        
        if (currentEsn === previousEsn) {
            const engineFields = [
                { current: 'engine.totalCycleRange.start', previous: 'engine.totalCycleRange.end', name: 'Engine CSN' },
                { current: 'engine.totalHourRange.start', previous: 'engine.totalHourRange.end', name: 'Engine TSN' }
            ]
            
            engineFields.forEach(field => {
                const currentVal = getFieldValue(currentEntry, field.current)
                const previousVal = getFieldValue(previousEntry, field.previous)
                
                if (!isEmpty(currentVal) && !isEmpty(previousVal) && currentVal !== previousVal) {
                    addError(currentEntry.id, field.current, {
                        code: 'EOP03',
                        severity: 1,
                        error: 'Operational Period start values should equal previous period end values',
                        description: `${field.name} start (${currentVal}) should equal previous end (${previousVal})`
                    })
                }
            })
        }
    }
    
    // EOP04: Each operational period must have a different ESN or Operator compared to the previous period
    for (let i = 1; i < sortedEntries.length; i++) {
        const currentEntry = sortedEntries[i]
        const previousEntry = sortedEntries[i - 1]
        
        const currentEsn = getFieldValue(currentEntry, 'engine.esn')
        const previousEsn = getFieldValue(previousEntry, 'engine.esn')
        const currentOp = getFieldValue(currentEntry, 'op')
        const previousOp = getFieldValue(previousEntry, 'op')
        
        if (!isEmpty(currentEsn) && !isEmpty(previousEsn) && !isEmpty(currentOp) && !isEmpty(previousOp)) {
            if (currentEsn === previousEsn && currentOp === previousOp) {
                addError(currentEntry.id, 'engine.esn', {
                    code: 'EOP04',
                    severity: 2,
                    error: 'Each operational period must have a different ESN or Operator',
                    description: 'This period has the same ESN and Operator as the previous period'
                })
                addError(currentEntry.id, 'op', {
                    code: 'EOP04',
                    severity: 2,
                    error: 'Each operational period must have a different ESN or Operator',
                    description: 'This period has the same ESN and Operator as the previous period'
                })
            }
        }
    }
    
    // EOP05: Operational period start date must not be before previous period end date
    for (let i = 1; i < sortedEntries.length; i++) {
        const currentEntry = sortedEntries[i]
        const previousEntry = sortedEntries[i - 1]
        
        const currentStartDate = parseDate(getFieldValue(currentEntry, 'dateRange.start'))
        const previousEndDate = parseDate(getFieldValue(previousEntry, 'dateRange.end'))
        
        if (currentStartDate && previousEndDate && currentStartDate < previousEndDate) {
            addError(currentEntry.id, 'dateRange.start', {
                code: 'EOP05',
                severity: 1,
                error: 'Operational period start date must not be before previous period end date',
                description: 'Start date is before the previous period end date'
            })
        }
    }
    
    // GOP01: LLP CSN/TSN must not decrease across time
    for (let i = 1; i < sortedEntries.length; i++) {
        const currentEntry = sortedEntries[i]
        const previousEntry = sortedEntries[i - 1]
        
        const fields = [
            { field: 'part.totalCycleRange.end', name: 'LLP CSN' },
            { field: 'part.totalHourRange.end', name: 'LLP TSN' }
        ]
        
        fields.forEach(f => {
            const currentVal = getFieldValue(currentEntry, f.field)
            const previousVal = getFieldValue(previousEntry, f.field)
            
            if (!isEmpty(currentVal) && !isEmpty(previousVal) && currentVal < previousVal) {
                addError(currentEntry.id, f.field, {
                    code: 'GOP01',
                    severity: 1,
                    error: `${f.name} must not decrease across time`,
                    description: `Current value (${currentVal}) is less than previous value (${previousVal})`
                })
            }
        })
    }
    
    // GOP02: Engine CSN/TSN must not decrease across time
    const esnGroups = {}
    sortedEntries.forEach(entry => {
        const esn = getFieldValue(entry, 'engine.esn')
        if (!isEmpty(esn)) {
            if (!esnGroups[esn]) esnGroups[esn] = []
            esnGroups[esn].push(entry)
        }
    })
    
    Object.values(esnGroups).forEach(entries => {
        for (let i = 1; i < entries.length; i++) {
            const currentEntry = entries[i]
            const previousEntry = entries[i - 1]
            
            const fields = [
                { field: 'engine.totalCycleRange.end', name: 'Engine CSN' },
                { field: 'engine.totalHourRange.end', name: 'Engine TSN' }
            ]
            
            fields.forEach(f => {
                const currentVal = getFieldValue(currentEntry, f.field)
                const previousVal = getFieldValue(previousEntry, f.field)
                
                if (!isEmpty(currentVal) && !isEmpty(previousVal) && currentVal < previousVal) {
                    addError(currentEntry.id, f.field, {
                        code: 'GOP02',
                        severity: 1,
                        error: `${f.name} must not decrease across time`,
                        description: `Current value (${currentVal}) is less than previous value (${previousVal})`
                    })
                }
            })
        }
    })
    
    return validationErrors
}

const validationRules = [
    {
        "code": "EOP03",
        "order": 11,
        "severity": 1,
        "error": "Operational Period start values should equal previous birth values",
        "description": "Inspect the operational period following a birth entry.\nEnsure the following non empty fields start values is equal to the previous birth entry non empty fields end values:\n- LLP CSN/TSN\nIf the Birth entry is Engine+LLP also validate:\n- Engine CSN/TSN"
    },
    {
        "code": "EOP04",
        "order": 12,
        "severity": 2,
        "error": "Each operational period must have a different ESN or Operator compared to the previous period",
        "description": "Ensure that each period non empty ESN+Operator are not both equal to the previous period ESN+Operator"
    },
    {
        "code": "EOP05",
        "order": 13,
        "severity": 1,
        "error": "Operational period start date must not be before previous period end date",
        "description": "Ensure a period start date is at or after the end date of the previous period"
    },
    {
        "code": "GBR01",
        "order": 16,
        "severity": 1,
        "error": "Birth entry is missing",
        "description": "Ensure a birth entry exists"
    },
    {
        "code": "GBR02",
        "order": 17,
        "severity": 1,
        "error": "Birth entry must be the earliest",
        "description": "Ensure the birth entry end date is the lowest"
    },
    {
        "code": "GBR03",
        "order": 18,
        "severity": 1,
        "error": "Only one birth entry is expected",
        "description": "Ensure only one birth entry exists"
    },
    {
        "code": "GOP01",
        "order": 14,
        "severity": 1,
        "error": "LLP CSN/TSN must not decrease across time",
        "description": "Check non empty end values for all periods and birth for the following fields, ensure they never decrease:\n- LLP CSN/TSN"
    },
    {
        "code": "GOP02",
        "order": 15,
        "severity": 1,
        "error": "Engine CSN/TSN must not decrease across time",
        "description": "Track the non-empty CSN/TSN end values for each ESN across timeline and ensure they never decrease."
    },
    {
        "code": "IBR01",
        "order": 8,
        "severity": 1,
        "error": "Birth entry value is missing",
        "description": "Ensure the following fields have values:\n- End Date\n- End Engine CSN/TSN\n- End LLP CSN/TSN\nFor Engine+LLP Birth entries also ensure the following have values:\n- ESN"
    },
    {
        "code": "IOP01",
        "order": 0,
        "severity": 1,
        "error": "Operational Period value is missing",
        "description": "Ensure the following fields have values:\n- ESN\n- Operator\n- Start Date\n- Start Engine CSN/TSN\n- Start LLP CSN/TSN\nExcept for the final period - Also ensure the following fields have values:\n- End Date\n- End Engine CSN/TSN\n- End LLP CSN/TSN"
    },
    {
        "code": "IOP02",
        "order": 1,
        "severity": 1,
        "error": "Operational period end date must not precede start date",
        "description": "Compare non empty end date and start date of the operational period"
    },
    {
        "code": "IOP03",
        "order": 2,
        "severity": 1,
        "error": "Operational period end value must not be smaller than the start value",
        "description": "Ensure the following non empty fields end values are not smaller than the start values:\n- Engine CSN/TSN\n- LLP CSN/TSN"
    },
    {
        "code": "IOP04",
        "order": 3,
        "severity": 1,
        "error": "Operational period end value must be larger than the start value",
        "description": "Ensure the following fields non empty end values are larger than the start values:\n- Engine CSN/TSN\n- LLP CSN/TSN"
    },
    {
        "code": "IOP05",
        "order": 4,
        "severity": 1,
        "error": "Increase in LLP CSN must equal increase in Engine CSN",
        "description": "Ensure the difference between the non empty values of:\nend LLP CSN and start LLP CSN\nEqual the different between the non empty values of:\nend Engine CSN and start Engine CSN\nWithin each operational period"
    },
    {
        "code": "IOP06",
        "order": 5,
        "severity": 1,
        "error": "Increase in LLP TSN must equal increase in Engine TSN",
        "description": "Ensure the difference between the non empty values of:\nend LLP TSN and start LLP TSN\nEqual the different between the non empty values of:\nend Engine TSN and start Engine TSN\nWithin each operational period"
    },
    {
        "code": "IOP07",
        "order": 6,
        "severity": 1,
        "error": "If the LLP CSN increased the TSN must increase as well",
        "description": "Check the increase in LLP CSN values between start to end of period.\nIf the CSN increased the TSN must also increase - they do not need to increase by the same amount."
    },
    {
        "code": "IOP08",
        "order": 7,
        "severity": 1,
        "error": "If the Engine CSN increased the TSN must increase as well",
        "description": "Check the increase in Engine CSN values between start to end of period.\nIf the CSN increased the TSN must also increase - they do not need to increase by the same amount."
    }
]
