import { timelineService } from './services/timeline.service.js'
import { pdfService } from './services/pdf.service.js'

window.app = {
    onInit,
    onToggleTheme,
    onShowGroundings,
    onLoadPDF,
    onNextPage,
    onPrevPage,
    onAddBounds
}

// PDF state
let currentPageNum = 1
let totalPages = 0
let currentPdfUrl = null
let sampleBounds = [
    { bounds: [100, 700, 300, 750], label: 'Header' },
    { bounds: [100, 500, 400, 600], label: 'Table Section' },
    { bounds: [50, 100, 200, 150], label: 'Footer' }
]


async function onInit() {
    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'light') {
        document.documentElement.classList.add('light-theme')
    }

    const entries = await timelineService.query()

    renderEntries(entries)

}

function onToggleTheme() {
    const root = document.documentElement
    root.classList.toggle('light-theme')

    // Save preference to localStorage
    const isLight = root.classList.contains('light-theme')
    localStorage.setItem('theme', isLight ? 'light' : 'dark')
}


function renderEntries(entries) {
    const strHTMLs = entries.map(entry => {
        return `
        <tr>
            <td>
                ON
            </td>
            <td>
                ${entry.dateRange.start}
            </td>
            <td rowspan="2">
                ${entry.engine.esn.value}
            </td>
            <td>
                ${entry.engine.totalHourRange.start.value}
            </td>
            <td>
                ${entry.engine.totalCycleRange.start.value}
            </td>
            <td class="part-hours" rowspan="2" onclick="app.onShowGroundings('${entry.id}', 'part.hours')">
                ${entry.part.hours.value}
            </td>
            <td rowspan="2">
                ${entry.part.cycles.value}
            </td>
            <td rowspan="2">
                ${entry.part.totalHours.value}
            </td>
            <td rowspan="2">
                ${entry.part.totalCycles.value}
            </td>
            <td rowspan="2">
                ${entry.op.name}
            </td>
        </tr>    
        <tr>
            <td>
                OFF
            </td>
            <td>
               ${entry.dateRange.end}
            </td>
            <td>
                ${entry.engine.totalHourRange.end.value}
            </td>
            <td>
                ${entry.engine.totalCycleRange.end.value}
            </td>
        </tr>    
    `})

    document.querySelector('.timeline-table tbody').innerHTML = strHTMLs.join('')

}

async function onShowGroundings(entryId, fieldPath) {
    const groundings = timelineService.getGroundings(entryId, fieldPath)
    console.log('Groundings for', entryId, fieldPath, groundings)
    
    if (!groundings || groundings.length === 0) {
        alert('No groundings found for this field')
        return
    }
    
    // Get the first grounding (can be enhanced to handle multiple)
    const grounding = groundings[0]
    
    if (!grounding.url) {
        alert('No PDF URL found for this grounding')
        return
    }
    
    // Check if we need to load a different PDF
    if (currentPdfUrl !== grounding.url) {
        const result = await pdfService.loadPDF(grounding.url)
        
        if (result.success) {
            currentPdfUrl = grounding.url
            totalPages = result.numPages
        } else {
            alert('Error loading PDF: ' + result.error)
            return
        }
    }
    
    // Navigate to the page with the grounding
    currentPageNum = grounding.pageNum
    renderPageInfo()
    
    // Clear and render page with the specific grounding highlighted
    pdfService.clearBounds()
    await pdfService.renderPage(currentPageNum)
    
    // Draw the grounding bound with highlighting
    pdfService.drawBounds(
        [grounding.x1, grounding.y1, grounding.x2, grounding.y2],
        {
            strokeStyle: '#00FF00',  // Green for grounding highlight
            fillStyle: 'rgba(0, 255, 0, 0.25)',
            label: fieldPath,
            lineWidth: 3
        }
    )
    
    // Scroll to PDF viewer
    document.querySelector('.pdf-viewer-container').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    })
}

// PDF Viewer Functions
async function onLoadPDF() {
    const pdfUrl = 'pdf/doc1.pdf'
    const result = await pdfService.loadPDF(pdfUrl)
    
    if (result.success) {
        currentPdfUrl = pdfUrl
        totalPages = result.numPages
        currentPageNum = 1
        renderPageInfo()
        await renderCurrentPage()
    } else {
        alert('Error loading PDF: ' + result.error)
    }
}

async function renderCurrentPage() {
    pdfService.clearBounds()
    await pdfService.renderPage(currentPageNum)
    
    // Draw all sample bounds
    sampleBounds.forEach(item => {
        pdfService.drawBounds(item.bounds, {
            strokeStyle: '#FF0000',
            fillStyle: 'rgba(255, 0, 0, 0.15)',
            label: item.label,
            lineWidth: 2
        })
    })
}

function onNextPage() {
    if (currentPageNum < totalPages) {
        currentPageNum++
        renderPageInfo()
        renderCurrentPage()
    }
}

function onPrevPage() {
    if (currentPageNum > 1) {
        currentPageNum--
        renderPageInfo()
        renderCurrentPage()
    }
}

function onAddBounds() {
    // Example: Add a new random bound
    const newBound = {
        bounds: [
            Math.random() * 400 + 50,  // x1
            Math.random() * 600 + 100, // y1
            Math.random() * 400 + 100, // x2
            Math.random() * 600 + 150  // y2
        ],
        label: `Bound ${sampleBounds.length + 1}`
    }
    
    sampleBounds.push(newBound)
    renderCurrentPage()
    
    console.log('Added bound:', newBound)
}

function renderPageInfo() {
    document.getElementById('page-num').textContent = currentPageNum
    document.getElementById('page-count').textContent = totalPages
}