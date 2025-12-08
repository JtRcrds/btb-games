export const timelineService = {
    query,
    remove,
    split,
    confirm,
    getGroundings
}

const cellState = {
    draft: 'draft',
    reviewed: 'reviewed',
    edited: 'edited',
    confirmed: 'confirmed'
}


async function query() {
    return demoData
}


const demoData = [
    {
        id: 'entry-101',
        groundings: [{
            cFileId: 'cfile-101', pageNum: 2, txt: 'Engine 577351 Installed'
        }],
        dateRange: {
            start: {
                value: '13-Jul-2005',
                state: cellState.draft,
                groundings: [{
                    cFileId: 'cfile-101', pageNum: 2, x1: 145, y1: 498, x2: 255, y2: 523
                }]
            },
            end: {
                value: '25-Oct-2006',
                state: cellState.draft,
                groundings: [{
                    cFileId: 'cfile-101', pageNum: 2, x1: 140, y1: 465, x2: 255, y2: 490
                }]
            }
        },
        engine: {
            esn: {
                value: '577351',
                state: cellState.draft,
                groundings: [{
                    cFileId: 'cfile-101', pageNum: 2, x1: 132, y1: 595, x2: 198, y2: 620
                }]
            },
            totalHourRange: {
                start: {
                    value: 0,
                    state: cellState.draft
                },
                end: {
                    value: 1322,
                    state: cellState.draft,
                    groundings: [{
                        cFileId: 'cfile-101', pageNum: 2, x1: 135, y1: 370, x2: 185, y2: 395
                    }]
                }
            },
            totalCycleRange: {
                start: {
                    value: 0,
                    state: cellState.draft
                },
                end: {
                    value: 540,
                    state: cellState.draft,
                    groundings: [{
                        cFileId: 'cfile-101', pageNum: 2, x1: 140, y1: 335, x2: 180, y2: 360
                    }]
                }
            },

        },
        part: {
            hours: {
                value: 1322,
                state: cellState.draft
            },
            cycles: {
                value: 540,
                state: cellState.draft
            },
            totalHours: {
                value: 1322,
                state: cellState.draft,
                groundings: [{
                    cFileId: 'cfile-101', pageNum: 2, x1: 135, y1: 370, x2: 185, y2: 395
                }]
            },
            totalCycles: {
                value: 540,
                state: cellState.draft,
                groundings: [{
                    cFileId: 'cfile-101', pageNum: 2, x1: 140, y1: 335, x2: 180, y2: 360
                }]
            },

        },
        op: {
            id: 'op-101',
            name: 'LTU',
            state: cellState.draft,
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
                groundings: [{
                    cFileId: 'cfile-101', pageNum: 3, x1: 145, y1: 498, x2: 265, y2: 523
                }]
            },
            end: {
                value: '5-Dec-2012',
                state: cellState.draft,
                groundings: [{
                    cFileId: 'cfile-101', pageNum: 3, x1: 140, y1: 465, x2: 255, y2: 490
                }]
            }
        },
        engine: {
            esn: {
                value: '577351',
                state: cellState.draft,
                groundings: [{
                    cFileId: 'cfile-101', pageNum: 3, x1: 132, y1: 595, x2: 198, y2: 620
                }]
            },
            totalHourRange: {
                start: {
                    value: 1322,
                    state: cellState.draft
                },
                end: {
                    value: 19004,
                    state: cellState.draft,
                    groundings: [
                        { cFileId: 'cfile-101', pageNum: 2, x1: 135, y1: 370, x2: 185, y2: 395 },
                        { cFileId: 'cfile-101', pageNum: 3, x1: 135, y1: 370, x2: 195, y2: 395 }
                    ]
                }
            },
            totalCycleRange: {
                start: {
                    value: 540,
                    state: cellState.draft
                },
                end: {
                    value: 10125,
                    state: cellState.draft,
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
                state: cellState.draft
            },
            cycles: {
                value: 9585,
                state: cellState.draft
            },
            totalHours: {
                value: 19004,
                state: cellState.draft,
                groundings: [{
                    cFileId: 'cfile-101', pageNum: 3, x1: 135, y1: 370, x2: 195, y2: 395
                }]
            },
            totalCycles: {
                value: 10125,
                state: cellState.draft,
                groundings: [{
                    cFileId: 'cfile-101', pageNum: 3, x1: 140, y1: 335, x2: 202, y2: 360
                }]
            }
        },
        op: {
            id: 'op-102',
            name: 'AIR BERLIN',
            state: cellState.draft,
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

function confirm(entryId, fieldPath) {
    const entry = demoData.find(entry => entry.id === entryId)
    if (!entry) return false
    if (!fieldPath) return false
    const fieldPaths = fieldPath.split('.')
    let field = entry
    for (const path of fieldPaths) {
        field = field[path]
        if (!field) return false
    }
    field.state = cellState.confirmed
    return true
}