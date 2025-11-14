import { timelineService } from './services/timeline.service.js'
import { pdfService } from './services/pdf.service.js'

window.app = {
    onInit,
    onToggleTheme,
    onShowGroundings,
    onNextPage,
    onPrevPage
}

const pdfState = {
    currentPageNum: 1,
    totalPages: 0,
    currentPdfUrl: null
}


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
            <td class="cell-with-groundings" onclick="app.onShowGroundings('${entry.id}', 'dateRange.start')">
                ${entry.dateRange.start.value}
            </td>
            <td class="cell-with-groundings" rowspan="2" onclick="app.onShowGroundings('${entry.id}', 'engine.esn')">
                ${entry.engine.esn.value}
            </td>
            <td>
                ${entry.engine.totalHourRange.start.value.toLocaleString()}
            </td>
            <td>
                ${entry.engine.totalCycleRange.start.value.toLocaleString()}
            </td>
            <td class="cell-with-groundings" rowspan="2" onclick="app.onShowGroundings('${entry.id}', 'part.hours')">
                ${entry.part.hours.value.toLocaleString()}
            </td>
            <td  class="cell-with-groundings" rowspan="2" onclick="app.onShowGroundings('${entry.id}', 'part.cycles')">
                ${entry.part.cycles.value.toLocaleString()}
            </td>
            <td rowspan="2">
                ${entry.part.totalHours.value.toLocaleString()}
            </td>
            <td rowspan="2">
                ${entry.part.totalCycles.value.toLocaleString()}
            </td>
            <td rowspan="2" class="cell-with-groundings" onclick="app.onShowGroundings('${entry.id}', 'op')">
                ${entry.op.name}
            </td>
        </tr>    
        <tr>
            <td>
                OFF
            </td>
            <td class="cell-with-groundings" onclick="app.onShowGroundings('${entry.id}', 'dateRange.end')">
               ${entry.dateRange.end.value}
            </td>
            <td class="cell-with-groundings" onclick="app.onShowGroundings('${entry.id}', 'engine.totalHourRange.end')">
                ${entry.engine.totalHourRange.end.value.toLocaleString()}
            </td>
            <td class="cell-with-groundings" onclick="app.onShowGroundings('${entry.id}', 'engine.totalCycleRange.end')">
                ${entry.engine.totalCycleRange.end.value.toLocaleString()}
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
    if (pdfState.currentPdfUrl !== grounding.url) {
        const result = await pdfService.loadPDF(grounding.url)
        
        if (result.success) {
            pdfState.currentPdfUrl = grounding.url
            pdfState.totalPages = result.numPages
        } else {
            alert('Error loading PDF: ' + result.error)
            return
        }
    }
    
    // Navigate to the page with the grounding
    pdfState.currentPageNum = grounding.pageNum
    renderPageInfo()
    
    // Clear and render page with the specific grounding highlighted
    pdfService.clearBounds()
    await pdfService.renderPage(pdfState.currentPageNum)
    
    // Draw the grounding bound with highlighting
    pdfService.drawBounds(
        [grounding.x1, grounding.y1, grounding.x2, grounding.y2],
        {
            strokeStyle: '#8191ecff',  // Green for grounding highlight
            fillStyle: 'rgba(105, 163, 240, 0.25)',
            // label: fieldPath,
            lineWidth: 3
        }
    )
    
    // Scroll to PDF viewer
    document.querySelector('.pdf-viewer-container').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    })
}



async function renderCurrentPage() {
    pdfService.clearBounds()
    await pdfService.renderPage(pdfState.currentPageNum)
    
}

function onNextPage() {
    if (pdfState.currentPageNum < pdfState.totalPages) {
        pdfState.currentPageNum++
        renderPageInfo()
        renderCurrentPage()
    }
}

function onPrevPage() {
    if (pdfState.currentPageNum > 1) {
        pdfState.currentPageNum--
        renderPageInfo()
        renderCurrentPage()
    }
}

function renderPageInfo() {
    document.getElementById('page-num').textContent = pdfState.currentPageNum
    document.getElementById('page-count').textContent = pdfState.totalPages
}