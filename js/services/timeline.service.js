export const timelineService = {
    query,
    remove,
    split,
    toggleConfirm,
    getGroundings,
    updateFieldValue
}

const cellState = {
    draft: 'draft',
    // edited: 'edited',
    confirmed: 'confirmed'
}


async function query() {
    return demoData
}


const demoData = [
    {
        id: 'entry-101',
        dateRange: {
            start: {
                value: '13-Jul-2005',
                state: cellState.draft,
                edits: [],
                groundings: [{
                    cFileId: 'cfile-101', pageNum: 2, docId: 'doc-101', x1: 145, y1: 498, x2: 255, y2: 523
                }]
            },
            end: {
                value: '25-Oct-2006',
                state: cellState.draft,
                edits: [],
                groundings: [{
                    cFileId: 'cfile-101', pageNum: 2, x1: 140, y1: 465, x2: 255, y2: 490
                }]
            }
        },
        engine: {
            esn: {
                value: '577351',
                state: cellState.draft,
                edits: [
                    { at: '2025-06-10T11:00:00Z',  by: 'user1', from: '577352', to: '577351',},
                    { at: '2025-06-10T10:00:00Z',  by: 'user2', from: '577357', to: '577352'},
                ],
                groundings: [{
                    cFileId: 'cfile-101', pageNum: 2, x1: 132, y1: 595, x2: 198, y2: 620
                }]
            },
            totalHourRange: {
                start: {
                    value: 0,
                    state: cellState.draft,
                    edits: []
                },
                end: {
                    value: 1322,
                    state: cellState.draft,
                    edits: [],
                    groundings: [{
                        cFileId: 'cfile-101', pageNum: 2, x1: 135, y1: 370, x2: 185, y2: 395
                    }]
                }
            },
            totalCycleRange: {
                start: {
                    value: 0,
                    state: cellState.draft,
                    edits: []
                },
                end: {
                    value: 540,
                    state: cellState.draft,
                    edits: [],
                    groundings: [{
                        cFileId: 'cfile-101', pageNum: 2, x1: 140, y1: 335, x2: 180, y2: 360
                    }]
                }
            },

        },
        part: {
            hours: {
                value: 1322,
                state: cellState.draft,
                edits: []
            },
            cycles: {
                value: 540,
                state: cellState.draft,
                edits: []
            },
            totalHourRange: {
                start: {
                    value: 0,
                    state: cellState.draft,
                    edits: []
                },
                end: {
                    value: 1322,
                    state: cellState.draft,
                    edits: [],
                    groundings: [{
                        cFileId: 'cfile-101', pageNum: 2, x1: 135, y1: 370, x2: 185, y2: 395
                    }]
                }
            },
            totalCycleRange: {
                start: {
                    value: 0,
                    state: cellState.draft,
                    edits: []
                },
                end: {
                    value: 540,
                    state: cellState.draft,
                    edits: [],
                    groundings: [{
                        cFileId: 'cfile-101', pageNum: 2, x1: 140, y1: 335, x2: 180, y2: 360
                    }]
                }
            },

        },
        op: {
            id: 'op-101',
            value: 'LTU',
            state: cellState.draft,
            edits: [],
            groundings: [{
                cFileId: 'cfile-101', pageNum: 2, x1: 280, y1: 745, x2: 325, y2: 770
            }]
        },
    },
    {
        id: 'entry-102',
        dateRange: {

            start: {
                value: '25-Dec-2006',
                state: cellState.draft,
                edits: [],
                groundings: [{
                    cFileId: 'cfile-101', pageNum: 3, x1: 145, y1: 498, x2: 265, y2: 523
                }]
            },
            end: {
                value: '5-Dec-2012',
                state: cellState.draft,
                edits: [],
                groundings: [{
                    cFileId: 'cfile-101', pageNum: 3, x1: 140, y1: 465, x2: 255, y2: 490
                }]
            }
        },
        engine: {
            esn: {
                value: '577351',
                state: cellState.draft,
                edits: [],
                groundings: [{
                    cFileId: 'cfile-101', pageNum: 3, x1: 132, y1: 595, x2: 198, y2: 620
                }]
            },
            totalHourRange: {
                start: {
                    value: 1322,
                    state: cellState.draft,
                    edits: []
                },
                end: {
                    value: 19004,
                    state: cellState.draft,
                    edits: [],
                    groundings: [
                        { cFileId: 'cfile-101', pageNum: 2, x1: 135, y1: 370, x2: 185, y2: 395 },
                        { cFileId: 'cfile-101', pageNum: 3, x1: 135, y1: 370, x2: 195, y2: 395 }
                    ]
                }
            },
            totalCycleRange: {
                start: {
                    value: 540,
                    state: cellState.draft,
                    edits: []
                },
                end: {
                    value: 10125,
                    state: cellState.draft,
                    edits: [],
                    groundings: [
                        { cFileId: 'cfile-101', pageNum: 2, x1: 70, y1: 400, x2: 220, y2: 425 },
                        { cFileId: 'cfile-101', pageNum: 2, x1: 140, y1: 335, x2: 180, y2: 360 },
                        { cFileId: 'cfile-101', pageNum: 3, x1: 140, y1: 335, x2: 192, y2: 360 }
                    ]
                }
            },

        },
        part: {
            hours: {
                value: 17682,
                state: cellState.draft,
                edits: []
            },
            cycles: {
                value: 9585,
                state: cellState.draft,
                edits: []
            },
            totalHourRange: {
                start: {
                    value: 1322,
                    state: cellState.draft,
                    edits: []
                },
                end: {
                    value: 19004,
                    state: cellState.draft,
                    edits: [],
                    groundings: [{
                        cFileId: 'cfile-101', pageNum: 3, x1: 135, y1: 370, x2: 195, y2: 395
                    }]
                }
            },
            totalCycleRange: {
                start: {
                    value: 540,
                    state: cellState.draft,
                    edits: []
                },
                end: {
                    value: 10125,
                    state: cellState.draft,
                    edits: [],
                    groundings: [{
                        cFileId: 'cfile-101', pageNum: 3, x1: 140, y1: 335, x2: 202, y2: 360
                    }]
                }
            }
        },
        op: {
            id: 'op-102',
            value: 'AIR BERLIN',
            state: cellState.draft,
            edits: [],
            groundings: [{
                cFileId: 'cfile-101', pageNum: 3, x1: 280, y1: 745, x2: 400, y2: 770
            }]
        }
    }
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

function split(entryId) {
    const entryIdx = demoData.findIndex(entry => entry.id === entryId)
    if (entryIdx === -1) return false
    const entry = demoData[entryIdx]
    const newEntry = JSON.parse(JSON.stringify(entry))
    newEntry.id = `entry-${Date.now()}`
    demoData.splice(entryIdx + 1, 0, newEntry)
    return true
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
        
        field[lastProperty].edits.push({
            at: new Date().toISOString(),
            by: 'user1', // Hardcoded for now
            from: oldValue,
            to: newValue
        })
        
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

window.demoData = demoData // For debugging purposes