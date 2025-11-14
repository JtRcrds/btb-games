import { timelineService } from './services/timeline.service.js'
import { pdfService } from './services/pdf.service.js'

window.app = {
    onInit,
    onToggleTheme,
    onShowGroundings,
    onNextPage,
    onPrevPage,
    onNextGrounding,
    onPrevGrounding
}

const pdfState = {
    currentPageNum: 1,
    totalPages: 0,
    currentPdfUrl: null
}

const groundingNavigationState = {
    entryId: null,
    fieldPath: null,
    allGroundings: [],
    currentGroundingIndex: 0
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
    
    // Initialize navigation state
    groundingNavigationState.entryId = entryId
    groundingNavigationState.fieldPath = fieldPath
    groundingNavigationState.allGroundings = groundings.filter(g => g.url) // Only valid groundings
    groundingNavigationState.currentGroundingIndex = 0
    
    if (groundingNavigationState.allGroundings.length === 0) {
        alert('No valid PDF URL found for groundings')
        return
    }
    
    // Navigate to first grounding
    await navigateToGrounding(0)
    
    // Update grounding navigation UI
    updateGroundingNavigationUI()
    
    // Scroll to PDF viewer
    document.querySelector('.pdf-viewer-container').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    })
}

async function navigateToGrounding(index) {
    const grounding = groundingNavigationState.allGroundings[index]
    if (!grounding) return
    
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
    
    // Clear and render page
    pdfService.clearBounds()
    await pdfService.renderPage(pdfState.currentPageNum)
    
    // Find all groundings on the current page
    const groundingsOnThisPage = groundingNavigationState.allGroundings.filter(
        g => g.url === grounding.url && g.pageNum === grounding.pageNum
    )
    
    // Draw all groundings on this page
    const activeColor = getComputedStyle(document.documentElement).getPropertyValue('--grounding-highlight').trim()
    const activeBgColor = getComputedStyle(document.documentElement).getPropertyValue('--grounding-highlight-bg').trim()
    
    groundingsOnThisPage.forEach(g => {
        const isActive = g === grounding
        pdfService.drawBounds(
            [g.x1, g.y1, g.x2, g.y2],
            {
                strokeStyle: isActive ? activeColor : '#8191ecff',
                fillStyle: isActive ? activeBgColor : 'rgba(105, 163, 240, 0.15)',
                lineWidth: isActive ? 4 : 2
            }
        )
    })
}

function onNextGrounding() {
    if (groundingNavigationState.currentGroundingIndex < groundingNavigationState.allGroundings.length - 1) {
        groundingNavigationState.currentGroundingIndex++
        navigateToGrounding(groundingNavigationState.currentGroundingIndex)
        updateGroundingNavigationUI()
    }
}

function onPrevGrounding() {
    if (groundingNavigationState.currentGroundingIndex > 0) {
        groundingNavigationState.currentGroundingIndex--
        navigateToGrounding(groundingNavigationState.currentGroundingIndex)
        updateGroundingNavigationUI()
    }
}

function updateGroundingNavigationUI() {
    const currentIdx = groundingNavigationState.currentGroundingIndex
    const total = groundingNavigationState.allGroundings.length
    
    document.getElementById('grounding-num').textContent = currentIdx + 1
    document.getElementById('grounding-count').textContent = total
    document.getElementById('grounding-field').textContent = groundingNavigationState.fieldPath || ''
    
    // Enable/disable navigation buttons
    const prevBtn = document.getElementById('prev-grounding-btn')
    const nextBtn = document.getElementById('next-grounding-btn')
    
    if (prevBtn) prevBtn.disabled = currentIdx === 0
    if (nextBtn) nextBtn.disabled = currentIdx === total - 1
    
    // Show/hide grounding navigation - only show if more than 1 grounding
    const groundingNav = document.querySelector('.grounding-navigation')
    if (groundingNav) {
        groundingNav.style.display = total > 1 ? 'flex' : 'none'
    }
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