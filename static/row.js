export default function Row({id, question, answer, learned}) {
    const row = document.createElement('tr')
    row.className = "flashcards-row"
    row.innerHTML = `
        <td class="flashcards-cell cell-id">${id}</td>
        <td class="flashcards-cell cell-question">${question}</td>
        <td class="flashcards-cell cell-answer">${answer}</td>
        <td class="flashcards-cell cell-learned">${learned}</td>
    `

    return row;
}