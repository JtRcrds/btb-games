import { timelineService } from './services/timeline.service.js'
import { pdfService } from './services/pdf.service.js'

window.app = {
    onInit,
    onToggleTheme,
    onToggleDetails,
    onNextPage,
    onPrevPage,
    onNextGrounding,
    onPrevGrounding,
    onRemoveEntry,
    onConfirmCell,
    onEditCell,
    onUndoEdit,
    onAddEntry,
    onDownloadCSV,
    onSignOff,
    onToggleResearchPanel,
    onSelectDoc,
    onShowMoreDocs,
    onAddAsGrounding,
    onViewNonGroundedDoc
}
// setInterval(() => {
//     lucide.createIcons()
// }, 500)



const pdfState = {
    currentPageNum: 1,
    totalPages: 0,
    currentPdfUrl: null,
    currentDocName: null
}

const groundingNavigationState = {
    entryId: null,
    fieldPath: null,
    allGroundings: [],
    currentGroundingIndex: 0,
    showAllDocs: false,
    initialDocsLimit: 3
}

let validationErrors = {}

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
    initDraggableModal()
}

function onToggleTheme() {
    const root = document.documentElement
    root.classList.toggle('dark-theme')

    // Save preference to localStorage
    const isDark = root.classList.contains('dark-theme')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
}

function onToggleResearchPanel(entryId) {
    const researchRow = document.getElementById(`research-row-${entryId}`)
    const researchPanel = document.getElementById(`research-panel-${entryId}`)
    
    if (!researchRow || !researchPanel) return
    
    researchPanel.classList.remove('expanded')
    setTimeout(() => {
        researchRow.classList.remove('visible')
    }, 300)
    
    // Clear selected cell styling
    document.querySelectorAll('.data-cell.selected').forEach(cell => {
        cell.classList.remove('selected')
    })
}

async function onToggleDetails(ev, entryId, fieldPath) {
    if (ev) {
        ev.target.closest('td').focus()
    }

    const researchRow = document.getElementById(`research-row-${entryId}`)
    const researchPanel = document.getElementById(`research-panel-${entryId}`)
    
    if (!researchRow || !researchPanel) return
    
    const isVisible = researchRow.classList.contains('visible')
    const isSameEntry = groundingNavigationState.entryId === entryId
    const isSameField = groundingNavigationState.fieldPath === fieldPath
    
    // If panel is open for the same entry but different field, just update the content
    if (isVisible && isSameEntry && !isSameField) {
        // Just update the content without closing/opening animation
        await loadGroundingsForField(entryId, fieldPath)
        return
    }
    
    // If clicking the same field when panel is open, do nothing (or toggle off if preferred)
    if (isVisible && isSameEntry && isSameField) {
        // Already showing this field, do nothing
        return
    }
    
    // Close all other research panels (from different entries)
    document.querySelectorAll('.research-row.visible').forEach(row => {
        if (row.id !== `research-row-${entryId}`) {
            const panel = row.querySelector('.research-panel')
            if (panel) {
                panel.classList.remove('expanded')
                setTimeout(() => {
                    row.classList.remove('visible')
                }, 300)
            }
        }
    })
    
    // Open this panel if not already visible
    if (!isVisible) {
        researchRow.classList.add('visible')
        setTimeout(() => {
            researchPanel.classList.add('expanded')
        }, 10)
    }

    // Load groundings for the selected field
    await loadGroundingsForField(entryId, fieldPath)
    lucide.createIcons()
}

async function loadGroundingsForField(entryId, fieldPath) {
    // Load groundings
    const groundings = timelineService.getGroundings(entryId, fieldPath)
    console.log('Groundings for', entryId, fieldPath, groundings)

    // Update selected cell styling
    updateSelectedCell(entryId, fieldPath)

    // Initialize navigation state
    groundingNavigationState.entryId = entryId
    groundingNavigationState.fieldPath = fieldPath
    groundingNavigationState.allGroundings = groundings
    groundingNavigationState.currentGroundingIndex = 0
    
    // If no groundings, automatically show all docs
    groundingNavigationState.showAllDocs = groundings.length === 0

    if (groundingNavigationState.allGroundings.length === 0) {
        // Show message about no groundings and render all available docs
        await renderDocumentList(entryId, groundings)
        
        // Hide grounding navigation since there are no groundings
        const groundingNav = document.getElementById(`grounding-nav-${entryId}`)
        if (groundingNav) {
            groundingNav.style.display = 'none'
        }
        
        // Clear PDF viewer and show placeholder message
        const pdfContainer = document.getElementById(`pdf-container-${entryId}`)
        const docNameEl = document.getElementById(`doc-name-${entryId}`)
        if (docNameEl) {
            docNameEl.textContent = 'Select a document to view'
        }
        
        // Clear canvas
        const canvasSuffix = `-${entryId}`
        const pdfCanvas = document.getElementById(`pdf-canvas${canvasSuffix}`)
        const boundsCanvas = document.getElementById(`bounds-canvas${canvasSuffix}`)
        if (pdfCanvas) {
            const ctx = pdfCanvas.getContext('2d')
            ctx.clearRect(0, 0, pdfCanvas.width, pdfCanvas.height)
        }
        if (boundsCanvas) {
            const ctx = boundsCanvas.getContext('2d')
            ctx.clearRect(0, 0, boundsCanvas.width, boundsCanvas.height)
        }
        
        return
    }

    // Navigate to first grounding
    await navigateToGrounding(0)

    // Update grounding navigation UI
    updateGroundingNavigationUI()

    // Render document list
    await renderDocumentList(entryId, groundings)
}

function updateSelectedCell(entryId, fieldPath) {
    // Remove 'selected' class from all cells
    document.querySelectorAll('.data-cell.selected').forEach(cell => {
        cell.classList.remove('selected')
    })
    
    // Add 'selected' class to the current cell
    const currentCell = document.querySelector(
        `.data-cell[data-entry-id="${entryId}"][data-field-path="${fieldPath}"]`
    )
    if (currentCell) {
        currentCell.classList.add('selected')
    }
}

async function renderDocumentList(entryId, groundings) {
    const docListContainer = document.querySelector(`#research-row-${entryId} .doc-list`)
    if (!docListContainer) return

    // Get relevant docs from the service using the current field path
    const fieldPath = groundingNavigationState.fieldPath
    const allDocs = await timelineService.getDocs(entryId, fieldPath)

    // Extract unique document IDs from groundings
    const docIdsInGroundings = [...new Set(groundings.map(g => g.docId))]

    // Separate docs into grounded and non-grounded
    const groundedDocs = allDocs.filter(doc => docIdsInGroundings.includes(doc.id))
    const nonGroundedDocs = allDocs.filter(doc => !docIdsInGroundings.includes(doc.id))

    if (groundedDocs.length === 0 && nonGroundedDocs.length === 0) {
        docListContainer.innerHTML = '<p class="no-docs">No documents found</p>'
        return
    }

    // Get current document ID from current grounding
    const currentGrounding = groundingNavigationState.allGroundings[groundingNavigationState.currentGroundingIndex]
    const currentDocId = currentGrounding?.docId

    // Render grounded document cards
    const groundedDocCards = groundedDocs.map(doc => {
        const primaryType = doc.types[0] || 'Unknown'
        const additionalTypes = doc.types.length > 1 ? ` +${doc.types.length - 1} more` : ''
        const isSelected = doc.id === currentDocId ? 'selected' : ''
        
        return `
            <div class="doc-card ${isSelected}" data-doc-id="${doc.id}" onclick="app.onSelectDoc('${doc.id}', '${entryId}')">
                <div class="doc-card-header">
                    <div class="doc-type">${primaryType}${additionalTypes}</div>
                    <div class="doc-date">${doc.date}</div>
                </div>
                <div class="doc-description">${doc.description}</div>
                <div class="doc-issuer">
                    <strong>${doc.issuer.type}:</strong> ${doc.issuer.name}
                </div>
                ${doc.esns.length > 0 ? `<div class="doc-esns"><strong>ESNs:</strong> ${doc.esns.join(', ')}</div>` : ''}
            </div>
        `
    }).join('')

    // Render non-grounded document cards (only if showing all)
    const nonGroundedDocCards = groundingNavigationState.showAllDocs ? nonGroundedDocs.map(doc => {
        const primaryType = doc.types[0] || 'Unknown'
        const additionalTypes = doc.types.length > 1 ? ` +${doc.types.length - 1} more` : ''
        
        return `
            <div class="doc-card non-grounded" data-doc-id="${doc.id}">
                <div class="doc-card-header">
                    <div class="doc-type">${primaryType}${additionalTypes}</div>
                    <div class="doc-date">${doc.date}</div>
                </div>
                <div class="doc-description">${doc.description}</div>
                <div class="doc-issuer">
                    <strong>${doc.issuer.type}:</strong> ${doc.issuer.name}
                </div>
                ${doc.esns.length > 0 ? `<div class="doc-esns"><strong>ESNs:</strong> ${doc.esns.join(', ')}</div>` : ''}
                <div class="doc-actions">
                    <button class="view-doc-btn" onclick="app.onViewNonGroundedDoc(event, '${doc.id}', '${entryId}')" title="View Document">
                        <i data-lucide="square-chart-gantt"></i>
                    </button>
                    <button class="add-grounding-btn" onclick="app.onAddAsGrounding(event, '${doc.id}', '${entryId}')">
                        <i data-lucide="plus"></i> Add as Grounding
                    </button>
                </div>
            </div>
        `
    }).join('') : ''

    // Special header for when there are no groundings
    let headerText, toggleButton
    
    if (groundedDocs.length === 0) {
        headerText = `<div class="doc-list-header no-groundings">
            <h4>No groundings yet</h4>
            <p>Add a grounding by selecting a document below</p>
        </div>`
        toggleButton = '' // Show all docs by default when no groundings
    } else {
        headerText = `<div class="doc-list-header"><h4>Grounding Documents <br/> (${groundedDocs.length} ${groundedDocs.length === 1 ? 'grounding' : 'groundings'})</h4></div>`
        toggleButton = nonGroundedDocs.length > 0
            ? `<button class="show-more-docs-btn" onclick="app.onShowMoreDocs('${entryId}')">
                   ${groundingNavigationState.showAllDocs ? 'Show Less' : `Show More (${nonGroundedDocs.length} more)`}
               </button>`
            : ''
    }

    docListContainer.innerHTML = `${headerText}${groundedDocCards}${toggleButton}${nonGroundedDocCards}`
}

async function onSelectDoc(docId, entryId) {
    // Get all docs to find the selected one
    const fieldPath = groundingNavigationState.fieldPath
    const allDocs = await timelineService.getDocs(entryId, fieldPath)
    const selectedDoc = allDocs.find(doc => doc.id === docId)
    
    if (!selectedDoc) return

    // Get groundings for the current field that belong to this document
    const currentGroundings = groundingNavigationState.allGroundings.filter(g => g.docId === docId)
    
    if (currentGroundings.length === 0) return

    // Update navigation state to focus on this document's groundings
    const firstGroundingIndex = groundingNavigationState.allGroundings.findIndex(g => g.docId === docId)
    if (firstGroundingIndex !== -1) {
        groundingNavigationState.currentGroundingIndex = firstGroundingIndex
        await navigateToGrounding(firstGroundingIndex)
        updateGroundingNavigationUI()
        
        // Refresh document list to update selected state
        await renderDocumentList(entryId, groundingNavigationState.allGroundings)
    }
}

async function onShowMoreDocs(entryId) {
    groundingNavigationState.showAllDocs = !groundingNavigationState.showAllDocs
    await renderDocumentList(entryId, groundingNavigationState.allGroundings)
    // Re-initialize lucide icons for the newly rendered content
    setTimeout(() => lucide.createIcons(), 0)
}

async function onViewNonGroundedDoc(event, docId, entryId) {
    event.stopPropagation()
    
    // Get the document to view
    const fieldPath = groundingNavigationState.fieldPath
    const allDocs = await timelineService.getDocs(entryId, fieldPath)
    const selectedDoc = allDocs.find(doc => doc.id === docId)
    
    if (!selectedDoc) return

    // Load and render the PDF in the viewer
    const loadResult = await pdfService.loadPDF(selectedDoc.url)
    if (!loadResult.success) {
        console.error('Failed to load PDF:', loadResult.error)
        return
    }
    
    pdfState.currentPdfUrl = selectedDoc.url
    pdfState.currentDocName = selectedDoc.description
    // Use pagesCount from doc metadata if available, otherwise use loadResult
    pdfState.totalPages = selectedDoc.pagesCount || loadResult.numPages
    pdfState.currentPageNum = 1
    
    // Render the first page
    await pdfService.renderPage(1, 1.0, entryId)
    
    // Update document name in UI
    const pdfContainer = document.getElementById(`pdf-container-${entryId}`)
    const docNameEl = document.getElementById(`doc-name-${entryId}`)
    if (docNameEl) {
        docNameEl.textContent = selectedDoc.description
    }
    
    // Update page info within the specific entry's container
    const pageNumEl = document.getElementById(`page-num-${entryId}`)
    const pageCountEl = document.getElementById(`page-count-${entryId}`)
    if (pageNumEl) pageNumEl.textContent = pdfState.currentPageNum
    if (pageCountEl) pageCountEl.textContent = pdfState.totalPages
    
    // Hide grounding navigation since this document is not grounded yet
    const groundingNav = document.getElementById(`grounding-nav-${entryId}`)
    if (groundingNav) {
        groundingNav.style.display = 'none'
    }
}

async function onAddAsGrounding(event, docId, entryId) {
    event.stopPropagation()
    
    const fieldPath = groundingNavigationState.fieldPath
    
    // Add the document as a grounding
    const success = timelineService.addGrounding(entryId, fieldPath, docId, 1)
    
    if (success) {
        // Reload groundings for the field
        await loadGroundingsForField(entryId, fieldPath)
        
        // Show success message
        console.log('Successfully added document as grounding:', { docId, entryId, fieldPath })
    } else {
        alert('Failed to add document as grounding. It may already exist.')
    }
}

function hasValidationError(entryId, fieldPath) {
    return validationErrors[entryId]?.[fieldPath]?.length > 0
}

function getCellButtons(entry, fieldPath, fieldValue) {
    const field = fieldPath.split('.').reduce((obj, key) => obj?.[key], entry)
    const isConfirmed = field?.state === 'confirmed'
    const hasEdits = field?.edits && field.edits.length > 0
    const hasErrors = hasValidationError(entry.id, fieldPath)
    
    const popoverId = `edit-popover-${entry.id}-${fieldPath.replace(/\./g, '-')}`
    const anchorId = `anchor-${entry.id}-${fieldPath.replace(/\./g, '-')}`
    const validationPopoverId = `validation-popover-${entry.id}-${fieldPath.replace(/\./g, '-')}`
    const validationAnchorId = `validation-anchor-${entry.id}-${fieldPath.replace(/\./g, '-')}`
    
    return `
        ${hasErrors ? `<button id="${validationAnchorId}" class="validation-indicator" popovertarget="${validationPopoverId}" type="button"><i data-lucide="shield-alert"></i></button>` : ''}
        ${hasEdits ? `<button id="${anchorId}" class="edit-indicator" popovertarget="${popoverId}" type="button"><i data-lucide="file-edit"></i></button>` : ''}
        <button title="${isConfirmed ? 'Unconfirm' : hasErrors ? 'Cannot confirm - has validation errors' : 'Confirm'}" ${hasErrors && !isConfirmed ? 'disabled' : ''} onclick="app.onConfirmCell(event, '${entry.id}', '${fieldPath}')">
            <i data-lucide="${isConfirmed ? 'book-open-check' : 'book-check'}"></i>
        </button>
        <button title="Show/Hide Details" onclick="app.onToggleDetails(event, '${entry.id}', '${fieldPath}')">
            <i data-lucide="eye"></i>
        </button>
        <button title="Edit" ${isConfirmed ? 'hidden' : ''} onclick="app.onEditCell(event, '${entry.id}', '${fieldPath}${fieldValue !== undefined ? '' : '.value'}', ${typeof fieldValue === 'string' ? `'${fieldValue}'` : fieldValue})">
            <i data-lucide="pencil"></i>
        </button>
    `.trim()
}

function createEditPopover(entry, fieldPath) {
    const field = fieldPath.split('.').reduce((obj, key) => obj?.[key], entry)
    const hasEdits = field?.edits && field.edits.length > 0
    
    if (!hasEdits) return ''
    
    const popoverId = `edit-popover-${entry.id}-${fieldPath.replace(/\./g, '-')}`
    const anchorId = `anchor-${entry.id}-${fieldPath.replace(/\./g, '-')}`
    const editHistoryItems = field.edits.map((edit, index) => {
        const relativeTime = getRelativeTime(new Date(edit.at))
        return `<div class="edit-history-item">
            <div class="edit-history-text">Edit ${index + 1}: ${edit.from} → ${edit.to} (by ${edit.by} ${relativeTime})</div>
            <button class="edit-undo-btn" onclick="app.onUndoEdit(event, '${entry.id}', '${fieldPath}', ${index})" title="Undo this edit">
                <i data-lucide="undo"></i>
            </button>
        </div>`
    }).join('')
    
    return `<div id="${popoverId}" popover anchor="${anchorId}" class="edit-history-popover"><div class="edit-history-header">Edit History:</div>${editHistoryItems}</div>`
}

function createValidationPopover(entry, fieldPath) {
    const errors = validationErrors[entry.id]?.[fieldPath]
    if (!errors || errors.length === 0) return ''
    
    const popoverId = `validation-popover-${entry.id}-${fieldPath.replace(/\./g, '-')}`
    const anchorId = `validation-anchor-${entry.id}-${fieldPath.replace(/\./g, '-')}`
    
    const errorItems = errors.map((error, index) => {
        const severityClass = error.severity === 1 ? 'severity-error' : 'severity-warning'
        return `<div class="validation-error-item ${severityClass}">
            <div class="validation-error-code">[${error.code}]</div>
            <div class="validation-error-text">
                <strong>${error.error}</strong>
                <p>${error.description}</p>
            </div>
        </div>`
    }).join('')
    
    return `<div id="${popoverId}" popover anchor="${anchorId}" class="validation-popover"><div class="validation-header">Validation Errors:</div>${errorItems}</div>`
}

function getRelativeTime(date) {
    const now = new Date()
    const diffMs = now - date
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffSecs < 60) return 'just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7)
        return `${weeks} week${weeks !== 1 ? 's' : ''} ago`
    }
    if (diffDays < 365) {
        const months = Math.floor(diffDays / 30)
        return `${months} month${months !== 1 ? 's' : ''} ago`
    }
    const years = Math.floor(diffDays / 365)
    return `${years} year${years !== 1 ? 's' : ''} ago`
}

async function renderEntries() {
    const entries = await timelineService.query()
    
    // Run validation
    validationErrors = timelineService.validateData()
    
    // Remove old popovers
    document.querySelectorAll('.edit-history-popover, .validation-popover').forEach(el => el.remove())
    
    // Collect all popovers
    const allPopovers = []
    const fieldPaths = ['op', 'dateRange.start', 'dateRange.end', 'engine.esn', 
                        'engine.totalCycleRange.start', 'engine.totalCycleRange.end',
                        'engine.totalHourRange.start', 'engine.totalHourRange.end',
                        'part.totalHourRange.start', 'part.totalHourRange.end',
                        'part.totalCycleRange.start', 'part.totalCycleRange.end']
    
    entries.forEach(entry => {
        fieldPaths.forEach(fieldPath => {
            const editPopover = createEditPopover(entry, fieldPath)
            if (editPopover) allPopovers.push(editPopover)
            
            const validationPopover = createValidationPopover(entry, fieldPath)
            if (validationPopover) allPopovers.push(validationPopover)
        })
    })
    
    const strHTMLs = entries.map(entry => {
        return `
        <tr>
            <td rowspan="2" tabindex="0" class="data-cell ${entry.op.state} ${hasValidationError(entry.id, 'op') ? 'invalid' : ''}" data-entry-id="${entry.id}" data-field-path="op">
                ${entry.op.value}
                ${getCellButtons(entry, 'op', entry.op.value)}
            </td>
            <td>
                ON
            </td>
            <td class="data-cell ${entry.dateRange.start.state} ${hasValidationError(entry.id, 'dateRange.start') ? 'invalid' : ''}" tabindex="0" data-entry-id="${entry.id}" data-field-path="dateRange.start">
                ${entry.dateRange.start.value}
                ${getCellButtons(entry, 'dateRange.start', entry.dateRange.start.value)}
            </td>
            <td class="data-cell ${entry.engine.esn.state} ${hasValidationError(entry.id, 'engine.esn') ? 'invalid' : ''}" tabindex="0" rowspan="2" data-entry-id="${entry.id}" data-field-path="engine.esn">
                ${entry.engine.esn.value}
                ${getCellButtons(entry, 'engine.esn', entry.engine.esn.value)}
            </td>
            <td class="data-cell ${entry.engine.totalCycleRange.start.state} ${hasValidationError(entry.id, 'engine.totalCycleRange.start') ? 'invalid' : ''}" tabindex="0">
                ${entry.engine.totalCycleRange.start.value.toLocaleString()}
                ${getCellButtons(entry, 'engine.totalCycleRange.start', entry.engine.totalCycleRange.start.value)}
        
            </td>
            <td class="data-cell ${entry.engine.totalHourRange.start.state} ${hasValidationError(entry.id, 'engine.totalHourRange.start') ? 'invalid' : ''}" tabindex="0">
                ${entry.engine.totalHourRange.start.value.toLocaleString()}
                ${getCellButtons(entry, 'engine.totalHourRange.start', entry.engine.totalHourRange.start.value)}
            </td>
            <td class="data-cell ${entry.part.totalHourRange.start.state} ${hasValidationError(entry.id, 'part.totalHourRange.start') ? 'invalid' : ''}" tabindex="0" data-entry-id="${entry.id}" data-field-path="part.totalHourRange.start">
                ${entry.part.totalHourRange.start.value.toLocaleString()}
                ${getCellButtons(entry, 'part.totalHourRange.start', entry.part.totalHourRange.start.value)}
            </td>
            <td class="data-cell ${entry.part.totalCycleRange.start.state} ${hasValidationError(entry.id, 'part.totalCycleRange.start') ? 'invalid' : ''}" tabindex="0" data-entry-id="${entry.id}" data-field-path="part.totalCycleRange.start">
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
            <td class="data-cell ${entry.dateRange.end.state} ${hasValidationError(entry.id, 'dateRange.end') ? 'invalid' : ''}" tabindex="0" data-entry-id="${entry.id}" data-field-path="dateRange.end">
               ${entry.dateRange.end.value}
               ${getCellButtons(entry, 'dateRange.end', entry.dateRange.end.value)}
            </td>
            <td class="data-cell ${entry.engine.totalCycleRange.end.state} ${hasValidationError(entry.id, 'engine.totalCycleRange.end') ? 'invalid' : ''}" tabindex="0" data-entry-id="${entry.id}" data-field-path="engine.totalCycleRange.end">
                ${entry.engine.totalCycleRange.end.value.toLocaleString()}
                ${getCellButtons(entry, 'engine.totalCycleRange.end', entry.engine.totalCycleRange.end.value)}
            </td>            
            <td class="data-cell ${entry.engine.totalHourRange.end.state} ${hasValidationError(entry.id, 'engine.totalHourRange.end') ? 'invalid' : ''}" tabindex="0" data-entry-id="${entry.id}" data-field-path="engine.totalHourRange.end">
                ${entry.engine.totalHourRange.end.value.toLocaleString()}
                ${getCellButtons(entry, 'engine.totalHourRange.end', entry.engine.totalHourRange.end.value)}
            </td>
            <td class="data-cell ${entry.part.totalHourRange.end.state} ${hasValidationError(entry.id, 'part.totalHourRange.end') ? 'invalid' : ''}" tabindex="0" data-entry-id="${entry.id}" data-field-path="part.totalHourRange.end">
                ${entry.part.totalHourRange.end.value.toLocaleString()}
                ${getCellButtons(entry, 'part.totalHourRange.end', entry.part.totalHourRange.end.value)}
            </td>
            <td class="data-cell ${entry.part.totalCycleRange.end.state} ${hasValidationError(entry.id, 'part.totalCycleRange.end') ? 'invalid' : ''}" tabindex="0" data-entry-id="${entry.id}" data-field-path="part.totalCycleRange.end">
                ${entry.part.totalCycleRange.end.value.toLocaleString()}
                ${getCellButtons(entry, 'part.totalCycleRange.end', entry.part.totalCycleRange.end.value)}
            </td>
           
        </tr>
        <tr id="research-row-${entry.id}" class="research-row">
            <td colspan="10" class="research-cell">
                <div id="research-panel-${entry.id}" class="research-panel">
                    <div class="research-header">
                        <div class="research-header-left">
                            <h3>Research Panel</h3>
                            <div class="field-path-display" id="field-path-${entry.id}" style="display: none;">
                                <strong>Field:</strong> <span id="grounding-field-${entry.id}"></span>
                            </div>
                        </div>
                        <button class="close-research-btn" onclick="app.onToggleResearchPanel('${entry.id}')">×</button>
                    </div>
                    <div class="research-content">
                        <div class="doc-list">
                        </div>
                        <div class="pdf-viewer-container" id="pdf-container-${entry.id}">
                            <div class="grounding-navigation" id="grounding-nav-${entry.id}" style="display: none;">
                                <div class="grounding-controls">
                                    <button id="prev-grounding-btn-${entry.id}" onclick="app.onPrevGrounding()">◄ Previous Grounding</button>
                                    <span id="grounding-info-${entry.id}">Grounding: <span id="grounding-num-${entry.id}">1</span> / <span id="grounding-count-${entry.id}">-</span></span>
                                    <button id="next-grounding-btn-${entry.id}" onclick="app.onNextGrounding()">Next Grounding ►</button>
                                </div>
                            </div>
                            <div class="pdf-doc-info">
                                <strong>Document:</strong> <span id="doc-name-${entry.id}">-</span>
                            </div>
                            <div class="pdf-controls">
                                <button onclick="app.onPrevPage()">◄ Previous Page</button>
                                <span id="page-info-${entry.id}">Page: <span id="page-num-${entry.id}">1</span> / <span id="page-count-${entry.id}">-</span></span>
                                <button onclick="app.onNextPage()">Next Page ►</button>
                            </div>
                            <div class="canvas-wrapper">
                                <canvas id="pdf-canvas-${entry.id}"></canvas>
                                <canvas id="bounds-canvas-${entry.id}"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </td>
        </tr>    
        <tr><td class="add-entry-cell" colspan="10">
            <button class="btn-add-entry" onclick="app.onAddEntry('${entry.id}')">
                <i data-lucide="plus"></i>
            </button>
        </td></tr>  

    `})

    document.querySelector('.timeline-table tbody').innerHTML = strHTMLs.join('')
    
    // Append all popovers to body
    if (allPopovers.length > 0) {
        document.body.insertAdjacentHTML('beforeend', allPopovers.join(''))
    }
    
    lucide.createIcons()
    
    // Setup popover positioning
    setupPopoverPositioning()

}

function setupPopoverPositioning() {
    document.querySelectorAll('[popovertarget]').forEach(trigger => {
        const popoverId = trigger.getAttribute('popovertarget')
        const popover = document.getElementById(popoverId)
        
        if (popover) {
            popover.addEventListener('toggle', (e) => {
                if (e.newState === 'open') {
                    const rect = trigger.getBoundingClientRect()
                    popover.style.position = 'absolute'
                    popover.style.top = `${rect.bottom + window.scrollY + 5}px`
                    popover.style.left = `${rect.left + window.scrollX}px`
                }
            })
        }
    })
}



async function navigateToGrounding(index) {
    const grounding = groundingNavigationState.allGroundings[index]
    if (!grounding) return

    const entryId = groundingNavigationState.entryId

    // Check if we need to load a different PDF
    if (pdfState.currentPdfUrl !== grounding.doc.url) {
        const result = await pdfService.loadPDF(grounding.doc.url)

        if (result.success) {
            pdfState.currentPdfUrl = grounding.doc.url
            pdfState.totalPages = result.numPages
            pdfState.currentDocName = grounding.doc.name
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
    await pdfService.renderPage(pdfState.currentPageNum, 1.0, entryId)

    // Find all groundings on the current page
    const groundingsOnThisPage = groundingNavigationState.allGroundings.filter(
        g => g.doc.url === grounding.doc.url && g.pageNum === grounding.pageNum
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
    const entryId = groundingNavigationState.entryId

    const groundingNumEl = document.getElementById(`grounding-num-${entryId}`)
    const groundingCountEl = document.getElementById(`grounding-count-${entryId}`)
    const groundingFieldEl = document.getElementById(`grounding-field-${entryId}`)
    const fieldPathDisplay = document.getElementById(`field-path-${entryId}`)

    if (groundingNumEl) groundingNumEl.textContent = currentIdx + 1
    if (groundingCountEl) groundingCountEl.textContent = total
    if (groundingFieldEl) groundingFieldEl.textContent = groundingNavigationState.fieldPath || ''
    
    // Show/hide field path display in header
    if (fieldPathDisplay) {
        fieldPathDisplay.style.display = groundingNavigationState.fieldPath ? 'flex' : 'none'
    }

    // Enable/disable navigation buttons
    const prevBtn = document.getElementById(`prev-grounding-btn-${entryId}`)
    const nextBtn = document.getElementById(`next-grounding-btn-${entryId}`)

    if (prevBtn) prevBtn.disabled = currentIdx === 0
    if (nextBtn) nextBtn.disabled = currentIdx === total - 1

    // Show/hide grounding navigation - show if there's at least 1 grounding
    const groundingNav = document.getElementById(`grounding-nav-${entryId}`)
    if (groundingNav) {
        groundingNav.style.display = total > 0 ? 'flex' : 'none'
    }
}



async function renderCurrentPage() {
    const entryId = groundingNavigationState.entryId
    pdfService.clearBounds()
    await pdfService.renderPage(pdfState.currentPageNum, 1.0, entryId)

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
    const entryId = groundingNavigationState.entryId
    if (!entryId) return
    
    const pageNumEl = document.getElementById(`page-num-${entryId}`)
    const pageCountEl = document.getElementById(`page-count-${entryId}`)
    if (pageNumEl) pageNumEl.textContent = pdfState.currentPageNum
    if (pageCountEl) pageCountEl.textContent = pdfState.totalPages
    
    const docNameEl = document.getElementById(`doc-name-${entryId}`)
    if (docNameEl && pdfState.currentDocName) {
        docNameEl.textContent = pdfState.currentDocName
    }
}

function setupTableKeyboardNavigation() {
    const table = document.querySelector('.timeline-table')

    // Add click handler for cells
    table.addEventListener('click', (e) => {
        const cell = e.target.closest('.data-cell')
        
        // Ignore clicks on buttons inside cells
        if (e.target.closest('button')) {
            return
        }
        
        if (cell) {
            const entryId = cell.dataset.entryId
            const fieldPath = cell.dataset.fieldPath
            
            if (entryId && fieldPath) {
                // If research panel is open for this entry, switch to the clicked field
                const researchRow = document.getElementById(`research-row-${entryId}`)
                if (researchRow && researchRow.classList.contains('visible')) {
                    onToggleDetails(null, entryId, fieldPath)
                }
            }
        }
    })

    table.addEventListener('keydown', (e) => {
        const activeCell = document.activeElement

        // Only handle if we're focused on a cell with groundings
        if (!activeCell.classList.contains('data-cell')) {
            return
        }

        // Enter or Space: Trigger grounding
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            const entryId = activeCell.dataset.entryId
            const fieldPath = activeCell.dataset.fieldPath
            if (entryId && fieldPath) {
                onToggleDetails(null, entryId, fieldPath)
            }
            return
        }

        // Arrow keys: Navigate
        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            return
        }

        e.preventDefault()

        const allCells = Array.from(table.querySelectorAll('.data-cell[tabindex="0"]'))
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
                    const cellsInNextRow = Array.from(nextRow.querySelectorAll('.data-cell[tabindex="0"]'))
                    nextCell = cellsInNextRow[0] // Move to first cell in next entry
                }
                break
            case 'ArrowUp':
                // Navigate to roughly the same column in previous row
                const prevRow = activeCell.closest('tr').previousElementSibling?.previousElementSibling
                if (prevRow) {
                    const cellsInPrevRow = Array.from(prevRow.querySelectorAll('.data-cell[tabindex="0"]'))
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

async function onUndoEdit(event, entryId, fieldPath, editIndex) {
    event.stopPropagation()
    
    if (timelineService.undoEdit(entryId, fieldPath, editIndex)) {
        await renderEntries()
        
        // Close the popover after undo
        const popoverId = `edit-popover-${entryId}-${fieldPath.replace(/\./g, '-')}`
        const popover = document.getElementById(popoverId)
        if (popover) {
            popover.hidePopover()
        }
    } else {
        alert('Failed to undo edit')
    }
}

async function onConfirmCell(ev, entryId, fieldPath) {
    ev.stopPropagation()
    
    // Get the field value to validate
    const entry = window.demoData.find(e => e.id === entryId)
    if (!entry) {
        alert('Entry not found')
        return
    }
    
    const field = fieldPath.split('.').reduce((obj, key) => obj?.[key], entry)
    if (!field) {
        alert('Field not found')
        return
    }
    
    // Check for validation errors
    const errors = validationErrors[entryId]?.[fieldPath]
    if (errors && errors.length > 0 && field.state !== 'confirmed') {
        const errorMessages = errors.map(e => `[${e.code}] ${e.error}`).join('\n')
        alert(`Cannot confirm field with validation errors:\n\n${errorMessages}`)
        return
    }
    
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
async function onAddEntry(prevEntryId) {
    if (!prevEntryId) return
    
    const prevEntry = window.demoData.find(entry => entry.id === prevEntryId)
    if (!prevEntry) return
    
    // Create new entry with copied values from previous entry
    const entryData = {
        op: prevEntry.op.value,
        dateRangeStart: prevEntry.dateRange.end.value,
        dateRangeEnd: '', // Empty, to be filled by user
        esn: prevEntry.engine.esn.value,
        engineTotalHourStart: prevEntry.engine.totalHourRange.end.value,
        engineTotalHourEnd: '',
        engineTotalCycleStart: prevEntry.engine.totalCycleRange.end.value,
        engineTotalCycleEnd: '',
        partTotalHourStart: prevEntry.part.totalHourRange.end.value,
        partTotalHourEnd: '',
        partTotalCycleStart: prevEntry.part.totalCycleRange.end.value,
        partTotalCycleEnd: ''
    }
    
    // Add entry via service, positioned right after the previous entry
    timelineService.addEntry(entryData, prevEntryId)
    
    // Re-render the table
    await renderEntries()
}



function onDownloadCSV() {
    const csv = timelineService.getAsCSV()
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `timeline-data-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
}

function onSignOff() {
    alert('Signing off...')
}

function initDraggableModal() {
    // Placeholder for drag functionality on modal dialogs
    // Can be implemented later if needed
}