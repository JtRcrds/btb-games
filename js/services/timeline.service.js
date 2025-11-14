export const timelineService = {
    query
}


async function query() {
    return demoData
}


const demoData = [
    {
        id: 'entry-101',
        dateRange: {
            start: '13-Jul-2005',
            end: '25-Oct-2006'
        },
        engine: {
            esn: {
                value: '577351',
                groundings: [{
                    cFileId: 'cfile-101', pageNum: 1, x1: 100, y1: 100, x2: 200, y2: 200
                }]
            },
            totalHourRange: {
                start: {
                    value: 0,
                    groundings: [{
                        cFileId: 'cfile-101', pageNum: 1, x1: 200, y1: 200, x2: 300, y2: 300
                    }]
                },
                end: {
                    value: 1322,
                    groundings: [{
                        cFileId: 'cfile-101', pageNum: 1, x1: 200, y1: 200, x2: 300, y2: 300
                    }]
                }
            },
            totalCycleRange: {
                start: {
                    value: 0,
                    groundings: [{
                        cFileId: 'cfile-101', pageNum: 1, x1: 200, y1: 200, x2: 300, y2: 300
                    }]
                },
                end: {
                    value: 540,
                    groundings: [{
                        cFileId: 'cfile-101', pageNum: 1, x1: 200, y1: 200, x2: 300, y2: 300
                    }]
                }
            },

        },
        part: {
            hours: {
                value: 1322,
                groundings: [{
                    cFileId: 'cfile-101', pageNum: 2, x1: 200, y1: 200, x2: 300, y2: 300
                }]
            },
            cycles: {
                value: 540,
                groundings: [{
                    cFileId: 'cfile-101', pageNum: 2, x1: 100, y1: 100, x2: 200, y2: 200
                }]
            },
            totalHours: {
                value: 1322,
            },
            totalCycles: {
                value: 540,
            },

        },
        op: {
            id: 'op-101',
            name: 'LTU'
        },
    },
    {
        id: 'entry-102',
        dateRange: {
            start: '25-Dec-2006',
            end: '5-Dec-2012'
        },
        engine: {
            esn: {
                value: '577351',
                groundings: [{
                    cFileId: 'cfile-101', pageNum: 1, x1: 100, y1: 100, x2: 200, y2: 200
                }]
            },
            totalHourRange: {
                start: {
                    value: 1322,
                    groundings: [{
                        cFileId: 'cfile-101', pageNum: 1, x1: 200, y1: 200, x2: 300, y2: 300
                    }]
                },
                end: {
                    value: 19004,
                    groundings: [{
                        cFileId: 'cfile-101', pageNum: 1, x1: 200, y1: 200, x2: 300, y2: 300
                    }]
                }
            },
            totalCycleRange: {
                start: {
                    value: 540,
                    groundings: [{
                        cFileId: 'cfile-101', pageNum: 1, x1: 200, y1: 200, x2: 300, y2: 300
                    }]
                },
                end: {
                    value: 10125,
                    groundings: [{
                        cFileId: 'cfile-101', pageNum: 1, x1: 200, y1: 200, x2: 300, y2: 300
                    }]
                }
            },

        },
        part: {
            hours: {
                value: 17682,
                groundings: [{
                    cFileId: 'cfile-101', pageNum: 2, x1: 200, y1: 200, x2: 300, y2: 300
                }]
            },
            cycles: {
                value: 9585,
                groundings: [{
                    cFileId: 'cfile-101', pageNum: 2, x1: 100, y1: 100, x2: 200, y2: 200
                }]
            },
            totalHours: {
                value: 19004,
            },
            totalCycles: {
                value: 10125,
            }
        },
        op: {
            id: 'op-102',
            name: 'AIR BERLIN'
        }
    }
]