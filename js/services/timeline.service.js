
export const timelineService = {
    query,
    remove,
    toggleConfirm,
    getGroundings,
    updateFieldValue,
    undoEdit,
    addEntry,
    getAsCSV
}

const cellState = {
    draft: 'draft',
    confirmed: 'confirmed'
}

//  Errors should be visible as border colors and/or badges
// ???
// const cellError = {
//     SourceMissing: 'no_source',
//     ConstitutiveMissing: 'no_constitutive',
//     Invalid: 'invalid'
// }


async function query() {
    return demoData
}


const demoData = [
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

// Add groundings manually for demo data since factory doesn't include them
demoData[0].dateRange.start.groundings = [
    _createGrounding({ cFileId: 'cfile-101', pageNum: 2, docId: 'doc-101', x1: 145, y1: 498, x2: 255, y2: 523 })
]
demoData[0].dateRange.end.groundings = [
    _createGrounding({ cFileId: 'cfile-101', pageNum: 2, docId: 'doc-101', x1: 140, y1: 465, x2: 255, y2: 490 })
]
demoData[0].engine.esn.groundings = [
    _createGrounding({ cFileId: 'cfile-101', pageNum: 2, docId: 'doc-101', x1: 132, y1: 595, x2: 198, y2: 620 })
]
demoData[0].engine.esn.edits = [
    _createEdit({ at: '2025-06-10T11:00:00Z', by: 'user1', from: '577352', to: '577351' }),
    _createEdit({ at: '2025-06-10T10:00:00Z', by: 'user2', from: '577357', to: '577352' })
]
demoData[0].engine.totalHourRange.end.groundings = [
    _createGrounding({ cFileId: 'cfile-101', pageNum: 2, docId: 'doc-101', x1: 135, y1: 370, x2: 185, y2: 395 })
]
demoData[0].engine.totalCycleRange.end.groundings = [
    _createGrounding({ cFileId: 'cfile-101', pageNum: 2, docId: 'doc-101', x1: 140, y1: 335, x2: 180, y2: 360 })
]
demoData[0].part.totalHourRange.end.groundings = [
    _createGrounding({ cFileId: 'cfile-101', pageNum: 2, docId: 'doc-101', x1: 135, y1: 370, x2: 185, y2: 395 })
]
demoData[0].part.totalCycleRange.end.groundings = [
    _createGrounding({ cFileId: 'cfile-101', pageNum: 2, docId: 'doc-101', x1: 140, y1: 335, x2: 180, y2: 360 })
]
demoData[0].op.groundings = [
    _createGrounding({ cFileId: 'cfile-101', pageNum: 2, docId: 'doc-101', x1: 280, y1: 745, x2: 325, y2: 770 })
]

demoData[1].dateRange.start.groundings = [
    _createGrounding({ cFileId: 'cfile-101', pageNum: 3, docId: 'doc-101', x1: 145, y1: 498, x2: 265, y2: 523 })
]
demoData[1].dateRange.end.groundings = [
    _createGrounding({ cFileId: 'cfile-101', pageNum: 3, docId: 'doc-101', x1: 140, y1: 465, x2: 255, y2: 490 })
]
demoData[1].engine.esn.groundings = [
    _createGrounding({ cFileId: 'cfile-101', pageNum: 3, docId: 'doc-101', x1: 132, y1: 595, x2: 198, y2: 620 })
]
demoData[1].engine.totalHourRange.end.groundings = [
    _createGrounding({ cFileId: 'cfile-101', pageNum: 2, docId: 'doc-101', x1: 135, y1: 370, x2: 185, y2: 395 }),
    _createGrounding({ cFileId: 'cfile-101', pageNum: 3, docId: 'doc-101', x1: 135, y1: 370, x2: 195, y2: 395 })
]
demoData[1].engine.totalCycleRange.end.groundings = [
    _createGrounding({ cFileId: 'cfile-101', pageNum: 2, docId: 'doc-101', x1: 70, y1: 400, x2: 220, y2: 425 }),
    _createGrounding({ cFileId: 'cfile-101', pageNum: 2, docId: 'doc-101', x1: 140, y1: 335, x2: 180, y2: 360 }),
    _createGrounding({ cFileId: 'cfile-101', pageNum: 3, docId: 'doc-101', x1: 140, y1: 335, x2: 192, y2: 360 })
]
demoData[1].part.totalHourRange.end.groundings = [
    _createGrounding({ cFileId: 'cfile-101', pageNum: 3, docId: 'doc-101', x1: 135, y1: 370, x2: 195, y2: 395 })
]
demoData[1].part.totalCycleRange.end.groundings = [
    _createGrounding({ cFileId: 'cfile-101', pageNum: 3, docId: 'doc-101', x1: 140, y1: 335, x2: 202, y2: 360 })
]
demoData[1].op.groundings = [
    _createGrounding({ cFileId: 'cfile-101', pageNum: 3, docId: 'doc-101', x1: 280, y1: 745, x2: 400, y2: 770 })
]

const cfileUrlMap = {
    'cfile-101': './pdf/doc1.pdf'
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
        return {
            ...grounding,
            url: cfileUrlMap[grounding.cFileId] || null
        }
    })

    return groundingsWithUrls
}

function remove(entryId) {
    const entryIdx = demoData.findIndex(entry => entry.id === entryId)
    if (entryIdx === -1) return false
    demoData.splice(entryIdx, 1)
    return true
}

function addEntry(entryData) {
    const newEntry = _createEntry(entryData)
    demoData.push(newEntry)
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
        x1,
        y1,
        x2,
        y2
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
                    value: engineTotalHourStart || 0,
                    state: cellState.draft,
                    edits: [],
                    groundings: []
                },
                end: {
                    value: engineTotalHourEnd || 0,
                    state: cellState.draft,
                    edits: [],
                    groundings: []
                }
            },
            totalCycleRange: {
                start: {
                    value: engineTotalCycleStart || 0,
                    state: cellState.draft,
                    edits: [],
                    groundings: []
                },
                end: {
                    value: engineTotalCycleEnd || 0,
                    state: cellState.draft,
                    edits: [],
                    groundings: []
                }
            }
        },
        part: {
            hours: {
                value: (partTotalHourEnd || 0) - (partTotalHourStart || 0),
                state: cellState.draft,
                edits: []
            },
            cycles: {
                value: (partTotalCycleEnd || 0) - (partTotalCycleStart || 0),
                state: cellState.draft,
                edits: []
            },
            totalHourRange: {
                start: {
                    value: partTotalHourStart || 0,
                    state: cellState.draft,
                    edits: [],
                    groundings: []
                },
                end: {
                    value: partTotalHourEnd || 0,
                    state: cellState.draft,
                    edits: [],
                    groundings: []
                }
            },
            totalCycleRange: {
                start: {
                    value: partTotalCycleStart || 0,
                    state: cellState.draft,
                    edits: [],
                    groundings: []
                },
                end: {
                    value: partTotalCycleEnd || 0,
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



window.demoData = demoData // For debugging purposes