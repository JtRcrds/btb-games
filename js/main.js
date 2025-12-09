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
    onConfirmCell,
    onEditCell,
    onAddEntry,
    onSignOff
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
    setTimeout(() => {
        lucide.createIcons()
    }, 1000)
    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark-theme')
    }
    await renderEntries()
    setupTableKeyboardNavigation()
    setupAddEntryForm()
}

function onToggleTheme() {
    const root = document.documentElement
    root.classList.toggle('dark-theme')

    // Save preference to localStorage
    const isDark = root.classList.contains('dark-theme')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
}


function getCellButtons(entry, fieldPath, fieldValue) {
    const field = fieldPath.split('.').reduce((obj, key) => obj?.[key], entry)
    const isConfirmed = field?.state === 'confirmed'
    const hasEdits = field?.edits && field.edits.length > 0
    
    // Build edit history tooltip
    let editTooltip = 'This field has been edited'
    if (hasEdits) {
        const editHistory = field.edits.map((edit, index) => {
            const date = new Date(edit.at).toLocaleString()
            return `Edit ${index + 1}: ${edit.from} → ${edit.to} (by ${edit.by} at ${date})`
        }).join('\n')
        editTooltip = `Edit History:\n${editHistory}`
    }
    
    return `
        ${hasEdits ? `<span class="edit-indicator" title="${editTooltip}"><i data-lucide="file-edit"></i></span>` : ''}
        <button title="${isConfirmed ? 'Unconfirm' : 'Confirm'}" onclick="app.onConfirmCell(event, '${entry.id}', '${fieldPath}')">
            <i data-lucide="${isConfirmed ? 'book-open-check' : 'book-check'}"></i>
        </button>
        <button title="Show Groundings" onclick="app.onShowGroundings(event, '${entry.id}', '${fieldPath}')">
            <i data-lucide="eye"></i>
        </button>
        <button title="Edit" ${isConfirmed ? 'hidden' : ''} onclick="app.onEditCell(event, '${entry.id}', '${fieldPath}${fieldValue !== undefined ? '' : '.value'}', ${typeof fieldValue === 'string' ? `'${fieldValue}'` : fieldValue})">
            <i data-lucide="pencil"></i>
        </button>
    `.trim()
}

async function renderEntries() {
    const entries = await timelineService.query()
    const strHTMLs = entries.map(entry => {
        return `
        <tr>
            <td rowspan="2" tabindex="0" class="cell-with-groundings ${entry.op.state}" data-entry-id="${entry.id}" data-field-path="op">
                ${entry.op.value}
                ${getCellButtons(entry, 'op', entry.op.value)}
            </td>
            <td>
                ON
            </td>
            <td class="cell-with-groundings ${entry.dateRange.start.state}" tabindex="0" data-entry-id="${entry.id}" data-field-path="dateRange.start">
                ${entry.dateRange.start.value}
                ${getCellButtons(entry, 'dateRange.start', entry.dateRange.start.value)}
            </td>
            <td class="cell-with-groundings ${entry.engine.esn.state}" tabindex="0" rowspan="2" data-entry-id="${entry.id}" data-field-path="engine.esn">
                ${entry.engine.esn.value}
                ${getCellButtons(entry, 'engine.esn', entry.engine.esn.value)}
            </td>
            <td class="cell-with-groundings ${entry.engine.totalCycleRange.start.state}" tabindex="0">
                ${entry.engine.totalCycleRange.start.value.toLocaleString()}
                ${getCellButtons(entry, 'engine.totalCycleRange.start', entry.engine.totalCycleRange.start.value)}
        
            </td>
            <td class="cell-with-groundings ${entry.engine.totalHourRange.start.state}" tabindex="0">
                ${entry.engine.totalHourRange.start.value.toLocaleString()}
                ${getCellButtons(entry, 'engine.totalHourRange.start', entry.engine.totalHourRange.start.value)}
            </td>
            <td class="cell-with-groundings ${entry.part.totalHourRange.start.state}" tabindex="0" data-entry-id="${entry.id}" data-field-path="part.totalHourRange.start">
                ${entry.part.totalHourRange.start.value.toLocaleString()}
                ${getCellButtons(entry, 'part.totalHourRange.start', entry.part.totalHourRange.start.value)}
            </td>
            <td class="cell-with-groundings ${entry.part.totalCycleRange.start.state}" tabindex="0" data-entry-id="${entry.id}" data-field-path="part.totalCycleRange.start">
                ${entry.part.totalCycleRange.start.value.toLocaleString()}
                ${getCellButtons(entry, 'part.totalCycleRange.start', entry.part.totalCycleRange.start.value)}
            </td>
            <td rowspan="2" data-entry-id="${entry.id}">
                ${entry.part.cycles.value.toLocaleString()}
            </td>
            <td rowspan="2" class="actions-cell">
                <button onclick="app.onRemoveEntry('${entry.id}')">x</button>
            </td>
        </tr>    
        <tr>
            <td>
                OFF
            </td>
            <td class="cell-with-groundings ${entry.dateRange.end.state}" tabindex="0" data-entry-id="${entry.id}" data-field-path="dateRange.end">
               ${entry.dateRange.end.value}
               ${getCellButtons(entry, 'dateRange.end', entry.dateRange.end.value)}
            </td>
            <td class="cell-with-groundings ${entry.engine.totalCycleRange.end.state}" tabindex="0" data-entry-id="${entry.id}" data-field-path="engine.totalCycleRange.end">
                ${entry.engine.totalCycleRange.end.value.toLocaleString()}
                ${getCellButtons(entry, 'engine.totalCycleRange.end', entry.engine.totalCycleRange.end.value)}
            </td>            
            <td class="cell-with-groundings ${entry.engine.totalHourRange.end.state}" tabindex="0" data-entry-id="${entry.id}" data-field-path="engine.totalHourRange.end">
                ${entry.engine.totalHourRange.end.value.toLocaleString()}
                ${getCellButtons(entry, 'engine.totalHourRange.end', entry.engine.totalHourRange.end.value)}
            </td>
            <td class="cell-with-groundings ${entry.part.totalHourRange.end.state}" tabindex="0" data-entry-id="${entry.id}" data-field-path="part.totalHourRange.end">
                ${entry.part.totalHourRange.end.value.toLocaleString()}
                ${getCellButtons(entry, 'part.totalHourRange.end', entry.part.totalHourRange.end.value)}
            </td>
            <td class="cell-with-groundings ${entry.part.totalCycleRange.end.state}" tabindex="0" data-entry-id="${entry.id}" data-field-path="part.totalCycleRange.end">
                ${entry.part.totalCycleRange.end.value.toLocaleString()}
                ${getCellButtons(entry, 'part.totalCycleRange.end', entry.part.totalCycleRange.end.value)}
            </td>
           
        </tr>    
        <tr><td class="add-entry-cell" colspan="10">
            <button class="btn-add-entry" onclick="app.onAddEntry('${entry.id}')">+</button>
        </td></tr>  

    `})

    document.querySelector('.timeline-table tbody').innerHTML = strHTMLs.join('')
    lucide.createIcons()

}

async function onShowGroundings(ev, entryId, fieldPath) {

    if (ev) {
        ev.target.closest('td').focus()
    }

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
                onShowGroundings(null, entryId, fieldPath)
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

async function onRemoveEntry(entryId) {
    if (!confirm('Are you sure you want to remove this entry?')) return
    if (timelineService.remove(entryId)) {
        await renderEntries()
    } else {
        alert('Failed to remove entry with ID: ' + entryId)
    }
}

async function onConfirmCell(ev, entryId, fieldPath) {
    ev.stopPropagation()
    if (timelineService.toggleConfirm(entryId, fieldPath)) {
        await renderEntries()
        if (document.querySelectorAll('td.draft').length === 0) {
            alert('All entries confirmed!')
            document.querySelector('.btn-sign').disabled = false
        } else {
            document.querySelector('.btn-sign').disabled = true
        }
    } else {
        alert('Failed to toggle confirm entry with ID: ' + entryId)
    }
}

function onEditCell(event, entryId, fieldPath, currentValue) {
    event.stopPropagation()
    

    const cell = event.target.closest('td')
    if (!cell) return

    // Prevent multiple edits
    if (cell.querySelector('input')) return

    // Store original content
    const originalContent = cell.innerHTML

    // Determine if this is a numeric field
    const isNumeric = typeof currentValue === 'number'

    // Create input element
    const input = document.createElement('input')
    input.type = isNumeric ? 'number' : 'text'
    input.value = currentValue
    input.className = 'cell-edit-input'

    // Clear cell and add input
    cell.innerHTML = ''
    cell.appendChild(input)
    cell.classList.add('cell-editing')

    // Focus and select all
    input.focus()
    input.select()

    // Track if we're already saving to prevent double-save
    let isSaving = false

    // Save function
    const save = async () => {
        if (isSaving) return
        isSaving = true

        let newValue = input.value.trim()

        // Validate and convert value
        if (isNumeric) {
            newValue = parseFloat(newValue)
            if (isNaN(newValue)) {
                alert('Please enter a valid number')
                input.focus()
                isSaving = false
                return
            }
        }

        // Check if value changed
        if (newValue === currentValue || (isNumeric && newValue === currentValue)) {
            cancel()
            return
        }

        // Update value in service
        if (timelineService.updateFieldValue(entryId, fieldPath, newValue)) {
            await renderEntries()
        } else {
            alert('Failed to update field')
            cancel()
        }
    }

    // Cancel function
    const cancel = () => {
        cell.classList.remove('cell-editing')
        cell.innerHTML = originalContent
    }

    // Event listeners
    input.addEventListener('blur', save)
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            input.removeEventListener('blur', save)
            save()
        } else if (e.key === 'Escape') {
            e.preventDefault()
            input.removeEventListener('blur', save)
            cancel()
        }
    })
}
function onAddEntry(prevEntryId) {
    const dialog = document.getElementById('add-entry-dialog')
    const form = document.getElementById('add-entry-form')
    
    // Reset form first
    form.reset()
    
    // If there's a previous entry, pre-fill the form
    if (prevEntryId) {
        const prevEntry = window.demoData.find(entry => entry.id === prevEntryId)
        if (prevEntry) {
            // Pre-fill operator and ESN from previous entry
            form.querySelector('[name="op"]').value = prevEntry.op.value
            form.querySelector('[name="esn"]').value = prevEntry.engine.esn.value
            
            // Set start date to previous entry's end date
            form.querySelector('[name="dateRangeStart"]').value = prevEntry.dateRange.end.value
            
            // Set engine total cycle start to previous entry's end
            form.querySelector('[name="engineTotalCycleStart"]').value = prevEntry.engine.totalCycleRange.end.value
            
            // Set engine total hour start to previous entry's end
            form.querySelector('[name="engineTotalHourStart"]').value = prevEntry.engine.totalHourRange.end.value
            
            // Set part total cycle start to previous entry's end
            form.querySelector('[name="partTotalCycleStart"]').value = prevEntry.part.totalCycleRange.end.value
            
            // Set part total hour start to previous entry's end
            form.querySelector('[name="partTotalHourStart"]').value = prevEntry.part.totalHourRange.end.value
        }
    }
    
    dialog.showModal()
}

function setupAddEntryForm() {
    const form = document.getElementById('add-entry-form')
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault()
        
        // Get form data
        const formData = new FormData(form)
        const entryData = {
            op: formData.get('op'),
            dateRangeStart: formData.get('dateRangeStart'),
            dateRangeEnd: formData.get('dateRangeEnd'),
            esn: formData.get('esn'),
            engineTotalHourStart: parseFloat(formData.get('engineTotalHourStart')),
            engineTotalHourEnd: parseFloat(formData.get('engineTotalHourEnd')),
            engineTotalCycleStart: parseFloat(formData.get('engineTotalCycleStart')),
            engineTotalCycleEnd: parseFloat(formData.get('engineTotalCycleEnd')),
            partTotalHourStart: parseFloat(formData.get('partTotalHourStart')),
            partTotalHourEnd: parseFloat(formData.get('partTotalHourEnd')),
            partTotalCycleStart: parseFloat(formData.get('partTotalCycleStart')),
            partTotalCycleEnd: parseFloat(formData.get('partTotalCycleEnd'))
        }
        
        // Add entry via service
        timelineService.addEntry(entryData)
        
        // Re-render the table
        await renderEntries()
        
        // Close dialog and reset form
        document.getElementById('add-entry-dialog').close()
        form.reset()
    })
}

function onSignOff() {
    alert('Signing off...')
}