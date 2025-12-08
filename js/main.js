import { timelineService } from './services/timeline.service.js'
import { pdfService } from './services/pdf.service.js'

window.app = {
    onInit,
    onToggleTheme,
    onShowGroundings,
    onNextPage,
    onPrevPage,
    onNextGrounding,
    onPrevGrounding,
    onRemoveEntry,
    onSplitEntry,
    onConfirmEntry,
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
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark-theme')
    }
    await renderEntries()    
    setupTableKeyboardNavigation()

}

function onToggleTheme() {
    const root = document.documentElement
    root.classList.toggle('dark-theme')

    // Save preference to localStorage
    const isDark = root.classList.contains('dark-theme')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
}


async function renderEntries() {
    const entries = await timelineService.query()
    const strHTMLs = entries.map(entry => {
        return `
        <tr>
            <td rowspan="2" tabindex="0" class="cell-with-groundings ${entry.op.state}" data-entry-id="${entry.id}" data-field-path="op" onclick="app.onShowGroundings('${entry.id}', 'op')">
                ${entry.op.name} 
                <button ${(entry.op.state === 'confirmed')? 'hidden' : ''} onclick="app.onConfirmEntry(event, '${entry.id}', 'op')">✅</button>
            </td>
            <td>
                ON
            </td>
            <td class="cell-with-groundings ${entry.dateRange.start.state}" tabindex="0" data-entry-id="${entry.id}" data-field-path="dateRange.start" onclick="app.onShowGroundings('${entry.id}', 'dateRange.start')">
                ${entry.dateRange.start.value}
                <button ${(entry.dateRange.start.state === 'confirmed')? 'hidden' : ''} onclick="app.onConfirmEntry(event, '${entry.id}', 'dateRange.start')">✅</button>
            </td>
            <td class="cell-with-groundings ${entry.engine.esn.state}" tabindex="0" rowspan="2" data-entry-id="${entry.id}" data-field-path="engine.esn" onclick="app.onShowGroundings('${entry.id}', 'engine.esn')">
                ${entry.engine.esn.value}
                <button ${(entry.engine.esn.state === 'confirmed')? 'hidden' : ''} onclick="app.onConfirmEntry(event, '${entry.id}', 'engine.esn')">✅</button>
            </td>
            <td>
                ${entry.engine.totalCycleRange.start.value.toLocaleString()}
            </td>
            <td>
                ${entry.engine.totalHourRange.start.value.toLocaleString()}
            </td>
            <td rowspan="2" class="cell-with-groundings ${entry.part.totalHours.state}" tabindex="0" data-entry-id="${entry.id}" data-field-path="part.totalHours" onclick="app.onShowGroundings('${entry.id}', 'part.totalHours')">
                ${entry.part.totalHours.value.toLocaleString()}
                <button ${(entry.part.totalHours.state === 'confirmed')? 'hidden' : ''} onclick="app.onConfirmEntry(event, '${entry.id}', 'part.totalHours')">✅</button>
            </td>
            <td rowspan="2" class="cell-with-groundings ${entry.part.totalCycles.state}" tabindex="0" data-entry-id="${entry.id}" data-field-path="part.totalCycles" onclick="app.onShowGroundings('${entry.id}', 'part.totalCycles')">
                ${entry.part.totalCycles.value.toLocaleString()}
                <button ${(entry.part.totalCycles.state === 'confirmed')? 'hidden' : ''} onclick="app.onConfirmEntry(event, '${entry.id}', 'part.totalCycles')">✅</button>
            </td>
            <td rowspan="2" data-entry-id="${entry.id}">
                ${entry.part.cycles.value.toLocaleString()}
            </td>
            <td rowspan="2" class="actions-cell">
                <button onclick="app.onRemoveEntry('${entry.id}')">x</button>
                <button onclick="app.onSplitEntry('${entry.id}')">Split</button>
            </td>
        </tr>    
        <tr>
            <td>
                OFF
            </td>
            <td class="cell-with-groundings ${entry.dateRange.end.state}" tabindex="0" data-entry-id="${entry.id}" data-field-path="dateRange.end" onclick="app.onShowGroundings('${entry.id}', 'dateRange.end')">
               ${entry.dateRange.end.value}
               <button ${(entry.dateRange.end.state === 'confirmed')? 'hidden' : ''} onclick="app.onConfirmEntry(event, '${entry.id}', 'dateRange.end')">✅</button>
            </td>
            <td class="cell-with-groundings ${entry.engine.totalHourRange.end.state}" tabindex="0" data-entry-id="${entry.id}" data-field-path="engine.totalHourRange.end" onclick="app.onShowGroundings('${entry.id}', 'engine.totalHourRange.end')">
                ${entry.engine.totalHourRange.end.value.toLocaleString()}
                <button ${(entry.engine.totalHourRange.end.state === 'confirmed')? 'hidden' : ''} onclick="app.onConfirmEntry(event, '${entry.id}', 'engine.totalHourRange.end')">✅</button>
            </td>
            <td class="cell-with-groundings ${entry.engine.totalCycleRange.end.state}" tabindex="0" data-entry-id="${entry.id}" data-field-path="engine.totalCycleRange.end" onclick="app.onShowGroundings('${entry.id}', 'engine.totalCycleRange.end')">
                ${entry.engine.totalCycleRange.end.value.toLocaleString()}
                <button ${(entry.engine.totalCycleRange.end.state === 'confirmed')? 'hidden' : ''} onclick="app.onConfirmEntry(event, '${entry.id}', 'engine.totalCycleRange.end')">✅</button>
            </td>
        </tr>    
    `})

    document.querySelector('.timeline-table tbody').innerHTML = strHTMLs.join('')

}

function getClassNameForEntry(entry) {
    const classNames = []
    classNames.push(entry.state)
    return classNames.join(' ')
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
    
    // Show PDF viewer
    document.querySelector('.pdf-viewer-container').style.display = 'block'
    
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

function setupTableKeyboardNavigation() {
    const table = document.querySelector('.timeline-table')
    
    table.addEventListener('keydown', (e) => {
        const activeCell = document.activeElement
        
        // Only handle if we're focused on a cell with groundings
        if (!activeCell.classList.contains('cell-with-groundings')) {
            return
        }
        
        // Enter or Space: Trigger grounding
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            const entryId = activeCell.dataset.entryId
            const fieldPath = activeCell.dataset.fieldPath
            if (entryId && fieldPath) {
                onShowGroundings(entryId, fieldPath)
            }
            return
        }
        
        // Arrow keys: Navigate
        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            return
        }
        
        e.preventDefault()
        
        const allCells = Array.from(table.querySelectorAll('.cell-with-groundings[tabindex="0"]'))
        const currentIndex = allCells.indexOf(activeCell)
        
        if (currentIndex === -1) return
        
        let nextCell = null
        
        switch (e.key) {
            case 'ArrowRight':
                nextCell = allCells[currentIndex + 1]
                break
            case 'ArrowLeft':
                nextCell = allCells[currentIndex - 1]
                break
            case 'ArrowDown':
                // Navigate to roughly the same column in next row
                const currentRow = activeCell.closest('tr')
                const nextRow = currentRow.nextElementSibling?.nextElementSibling // Skip to next entry (2 rows)
                if (nextRow) {
                    const cellsInNextRow = Array.from(nextRow.querySelectorAll('.cell-with-groundings[tabindex="0"]'))
                    nextCell = cellsInNextRow[0] // Move to first cell in next entry
                }
                break
            case 'ArrowUp':
                // Navigate to roughly the same column in previous row
                const prevRow = activeCell.closest('tr').previousElementSibling?.previousElementSibling
                if (prevRow) {
                    const cellsInPrevRow = Array.from(prevRow.querySelectorAll('.cell-with-groundings[tabindex="0"]'))
                    nextCell = cellsInPrevRow[cellsInPrevRow.length - 1] // Move to last cell in prev entry
                }
                break
        }
        
        if (nextCell) {
            nextCell.focus()
        }
    })
}

function onRemoveEntry(entryId) {
    if (!confirm('Are you sure you want to remove this entry?')) return
    if (timelineService.remove(entryId)) {
        renderEntries()
    } else {
        alert('Failed to remove entry with ID: ' + entryId)
    }
}   

function onSplitEntry(entryId) {
    if (!confirm('Are you sure you want to split this entry?')) return
    if (timelineService.split(entryId)) {
        renderEntries()
    } else {
        alert('Failed to split entry with ID: ' + entryId)
    }
}   

function onConfirmEntry(ev, entryId, fieldPath) {
    ev.stopPropagation()
    if (timelineService.confirm(entryId, fieldPath)) {
        renderEntries()
    } else {
        alert('Failed to confirm entry with ID: ' + entryId)
    }
}