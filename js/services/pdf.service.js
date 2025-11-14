export const pdfService = {
    loadPDF,
    renderPage,
    drawBounds,
    clearBounds,
    convertToViewportRectangle
}

let pdfDoc = null
let currentPage = null
let currentViewport = null

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

async function loadPDF(url) {
    try {
        console.log('Loading PDF from:', url)
        const loadingTask = pdfjsLib.getDocument(url)
        pdfDoc = await loadingTask.promise
        console.log('PDF loaded successfully, pages:', pdfDoc.numPages)
        return {
            success: true,
            numPages: pdfDoc.numPages
        }
    } catch (error) {
        console.error('Error loading PDF:', error)
        console.error('PDF URL was:', url)
        return {
            success: false,
            error: error.message
        }
    }
}

async function renderPage(pageNumber, scale = 1.5) {
    if (!pdfDoc) {
        throw new Error('PDF not loaded')
    }

    try {
        currentPage = await pdfDoc.getPage(pageNumber)
        currentViewport = currentPage.getViewport({ scale })

        const pdfCanvas = document.getElementById('pdf-canvas')
        const boundsCanvas = document.getElementById('bounds-canvas')
        const context = pdfCanvas.getContext('2d')

        // Set canvas dimensions
        pdfCanvas.width = currentViewport.width
        pdfCanvas.height = currentViewport.height
        boundsCanvas.width = currentViewport.width
        boundsCanvas.height = currentViewport.height

        // Render PDF page
        const renderContext = {
            canvasContext: context,
            viewport: currentViewport
        }

        await currentPage.render(renderContext).promise
        
        return {
            success: true,
            viewport: currentViewport
        }
    } catch (error) {
        console.error('Error rendering page:', error)
        return {
            success: false,
            error: error.message
        }
    }
}

function drawBounds(bounds, options = {}) {
    if (!currentViewport) {
        throw new Error('No page rendered')
    }

    const boundsCanvas = document.getElementById('bounds-canvas')
    const ctx = boundsCanvas.getContext('2d')

    const {
        strokeStyle = '#FF0000',
        lineWidth = 2,
        fillStyle = 'rgba(255, 0, 0, 0.1)',
        label = ''
    } = options

    // bounds is [x1, y1, x2, y2] in PDF coordinates
    const [x1, y1, x2, y2] = bounds

    // Convert PDF coordinates to viewport coordinates
    // PDF.js uses bottom-left origin, we need to adjust
    const viewportRect = currentViewport.convertToViewportRectangle([x1, y1, x2, y2])
    const [vx1, vy1, vx2, vy2] = viewportRect

    // Draw rectangle
    ctx.strokeStyle = strokeStyle
    ctx.lineWidth = lineWidth
    ctx.fillStyle = fillStyle

    const x = Math.min(vx1, vx2)
    const y = Math.min(vy1, vy2)
    const width = Math.abs(vx2 - vx1)
    const height = Math.abs(vy2 - vy1)

    ctx.fillRect(x, y, width, height)
    ctx.strokeRect(x, y, width, height)

    // Draw label if provided
    if (label) {
        ctx.fillStyle = strokeStyle
        ctx.font = '12px Arial'
        ctx.fillText(label, x + 5, y + 15)
    }
}

function clearBounds() {
    const boundsCanvas = document.getElementById('bounds-canvas')
    const ctx = boundsCanvas.getContext('2d')
    ctx.clearRect(0, 0, boundsCanvas.width, boundsCanvas.height)
}

function convertToViewportRectangle(bounds) {
    if (!currentViewport) {
        throw new Error('No page rendered')
    }
    return currentViewport.convertToViewportRectangle(bounds)
}

function getPDFDoc() {
    return pdfDoc
}

function getCurrentViewport() {
    return currentViewport
}
