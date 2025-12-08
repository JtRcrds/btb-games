
// Curr flow:
// CFile =>  OCR, LLM => ExtractedContents 
// Split to Docs
// PageInfo (Generic (issuer, date), Specific) 
// Unite pages into Docs (desc conactenation, Unique ESNs)

// Which ESNs are associated with which Docs


const cfiles = [
    {
        id: 'cfile-101',
        uri: 'some-uri',
        fileName: 'file1.pdf',
        fileType: 'application/pdf',
        uploadedAt: new Date().toISOString(),
        docs: [
            {
                id: 'doc-101',
                pageStart: 1,
                pageEnd: 2,
                types: ['opOnOffLog'], // see Doc Types below
                description: 'Operator On/Off Log created on 2018-01-01 by DHL',
                createdAt: '2025-01-01',
                signedAt: '2025-01-01',
                //expiredAt: '2025-01-01', //?
                tag: 'required',
                issuer: {
                    type: 'op',
                    name: 'DHL'
                },

                dataPoints: [
                    {
                        type: 'releaseCertificate.jurisdiction',
                        value: 'FAA',
                    },
                    {
                        type: 'nisnas.noExtremeHeat',
                        value: true,
                    },
                    {
                        type: 'nisnas.noSaltWater',
                        value: true,
                    }
                ],
                // VS.
                extractedData: {
                    releaseCertificate: {
                        jurisdiction: 'FAA',
                    },
                    statement: {
                        nisnas: {
                            clauses: {
                                noExtremeHeat: true,
                                noSaltWaterOperation: true,
                            }
                        }
                    },
                },


                observations: [
                    {
                        id: 'ob-101',
                        date: '2018-01-01',
                        ctg: 'operational', // commercial, operational
                        type: 'llpBirth', // see Observation Types below
                        summary: 'LLP birth',
                        dataPoint: {
                            type: 'op', // partTsn, engineCsn, engineTsn, engineSn
                            value: 'DHL',
                        },
                        bounding: { pageNum: 1, x1: 100, y1: 100, x2: 200, y2: 200 },
                    },
                    {
                        id: 'ob-102',
                        date: '2018-01-01',
                        ctg: 'lifeCycle', // commercial, operational
                        type: 'engineInstallWithLLP', // see Observation Types below
                        summary: 'LLP installed on engine ENG-101',
                        dataPoint: {
                            type: 'partCsn', // partTsn, engineCsn, engineTsn, engineSn
                            value: 18000,
                        },
                        bounding: { pageNum: 2, x1: 100, y1: 100, x2: 200, y2: 200 },
                    }
                ]
            }
        ]
    }
]



const proj = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'My Project - Fan Disk - SN001',
    status: 'new', // in-progress, completed, failed
    description: 'Project for tracking LLP traceability of Fan Disk SN001', // Ask Efrat
    type: 'llp_traceability', // eninge_tracability
    publicId: 'public-id-123', //?
    cfiles,
    pn: 'PN-001',
    sn: 'SN-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reports: [
        {
            id: 'proj-report-101',
            type: 'light',
            startedAt: new Date().toISOString(),
            doneAt: new Date().toISOString(),
            cycles: [
                {
                    id: 'cyc-101',
                    date: '2018-01-02',
                    type: 'Engine installed',
                    op: 'DHL',
                    comments: 'Engine installed on aircraft',
                    engine: {
                        esn: {
                            value: 'eng-101',
                            groundings: [{
                                cFileId: 'cfile-101',
                                docId: 'doc-101',
                                observationId: 'ob-103',
                            }]
                        },
                        csn: {
                            value: 18001,
                            groundings: [{
                                cFileId: 'cfile-101',
                                docId: 'doc-101',
                                observationId: 'ob-104',
                            }]
                        },
                        tsn: {
                            value: 22001,
                            groundings: [{
                                cFileId: 'cfile-101',
                                docId: 'doc-101',
                                observationId: 'ob-103',
                            }]
                        },
                    },
                    part: {
                        csn: {
                            value: 18001,
                            groundings: [{
                                cFileId: 'cfile-101',
                                docId: 'doc-101',
                                observationId: 'ob-102',
                            }]
                        },
                        tsn: {
                            value: 22001,
                            groundings: [{
                                cFileId: 'cfile-101',
                                docId: 'doc-101',
                                observationId: 'ob-101',
                            }]
                        },
                    },

                }
            ],
            discrepancies: [
                {
                    id: 'disc-101',
                    type: 'LLP Traceability',
                    title: 'HPC 9-12 DRUM - SN RRD5140',
                    description: 'LLP Traceability incomplete (ESN: ENG101)',
                    status: 'incomplete', // not_provided, ?
                    op: 'DHL',
                    csn: 18000,
                    // received?
                    todos: [
                        {
                            id: 'todo-101',
                            description: '200 cycle gap',
                            status: 'open',
                            closedBy: 'user-id', //?
                            closedAt: 'time',   //?
                            severity: 'major',
                            groundings: [{ cFileId: 'cfile-101', docId: 'doc-101', observationId: 'ob-101' }]
                        },
                        {
                            id: 'todo-102',
                            description: 'Serial number format inconsistent',
                            status: 'open',
                            severity: 'minor',
                        }
                    ]
                }
            ],
            ownerships: [
                {
                    id: 'comm-101',
                    op: 'DHL',
                    dateRange: { from: '2018-02-01', to: '2018-02-28' },
                    tsnRange: { from: 19946, to: 20625 },
                    csnRange: { from: 15009, to: 15601 },
                    docs: [
                        {
                            cFileId: 'cfile-101',
                            docId: 'doc-101',
                            status: 'complete',
                        }
                    ]
                    // missing docs?
                }
            ]


        }
    ]
}

// mini op for holding operator info in events
const op = {
    id: 'dhl',
    name: 'DHL',
    logoUrl: 'https://example.com/logos/dhl.png',
}

// Open issues:
// owner vs operator?
// event grouping? DEAD
// project scopes - not in UI
// CYC. ACC. (computed)  ; THRUST (currently not extracted, challanging)


function getCategoryDisplayName(ctg) {
    const ctgNameMap = {
        onoff_logs: 'On/Off logs',
        llp_traceability: 'LLP Traceability',
        maintenance_records: 'Maintenance Records',
        operator_statements: 'Operator Statements',
        commercial_trace: 'Commercial Trace'
    }
    return ctgNameMap[ctg]
}


// Observation types:
LLP_BIRTH = "LLP Birth"
ENGINE_WITH_LLP_BIRTH = "Engine Birth Including LLP"
LLP_INITIAL_INSTALLATION = "LLP Initial Installation (CSN Zero)"
LLP_REMOVAL = "LLP Removal from Engine"
ENGINE_INSTALLATION_WITH_LLP = "Engine Installation (with LLP)"
ENGINE_REMOVAL_WITH_LLP = "Engine Removal (with LLP)"
SHOP_VISIT = "Shop Visit"
FERRY_FLIGHT = "Ferry Flight"
TEST_FLIGHT = "Test Flight"
TRANSACTION = "Transaction (e.g., Bill of Sale)"
STATUS_REPORT_PRODUCED = "Status Report Produced"
PRESERVATION = "Preservation"
POWER_RATING_CONFIGURATION_CHANGED = "Power Rating / Configuration - Changed"
OTHER_EVENT = "Other Event"


// ?? More options for Observation types
DOC_REQUIRED = "Document Required"
OWNERSHIP_CHANGED = "Ownership Changed"




// Doc Types:
other
engine_delivery_document
release_certificate
llp_sheet
engine_configuration_report
operator_on_off_log
part_removal_tag
llp_btb_summary_table
engine_btb_summary_table
statement
faa_337_form
test_findings_report
test_cell_report
mpa_max_power_assurance
dfps
borescope_report
ata_106
engine_bill_of_sale
lease_placement
lease_return

// ...more?
// ninsnas 