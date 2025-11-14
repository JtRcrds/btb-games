// Unused code file for keeping bounds-related code snippets

let sampleBounds = [
    { bounds: [100, 700, 300, 750], label: 'Header' },
    { bounds: [100, 500, 400, 600], label: 'Table Section' },
    { bounds: [50, 100, 200, 150], label: 'Footer' }
]


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


// Draw all sample bounds
sampleBounds.forEach(item => {
    pdfService.drawBounds(item.bounds, {
        strokeStyle: '#FF0000',
        fillStyle: 'rgba(255, 0, 0, 0.15)',
        label: item.label,
        lineWidth: 2
    })
})


