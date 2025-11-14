import { timelineService } from './services/timeline.service.js'

window.app = {
    onInit,
    onToggleTheme,
    onShowGroundings
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

function onShowGroundings(entryId, fieldPath) {
    const groundings = timelineService.getGroundings(entryId, fieldPath)
    console.log('Groundings for', entryId, fieldPath, groundings)
}