export default function Row({id, question, answer, learned}) {
    const row = document.createElement('div')
    row.className = "flashcards-row"
    row.innerHTML = `
        <div class="flashcards-cell cell-1">${id}<div>
        <div class="flashcards-cell cell-2">${question}<div>
        <div class="flashcards-cell cell-3">${answer}<div>
        <div class="flashcards-cell cell-4">${learned}<div>
    `

    return row;
}