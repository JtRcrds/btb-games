
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
                tag: 'required',
                issuer: {
                    type: 'op',
                    name: 'DHL'
                },
                observations: [
                    {
                        id: 'ob-101',
                        date: '2018-01-01',
                        ctg: 'operational', // commercial, operational, lifeCycle
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
            },
        ],

    }
]



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
