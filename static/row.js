export default function Row({id, question, answer, learned}) {
    const row = document.createElement('tr')
    row.className = "flashcards-row"
    row.innerHTML = `
        <td class="flashcards-cell cell-id">${id}</td>
        <td class="flashcards-cell cell-question">${question}</td>
        <td class="flashcards-cell cell-answer">${answer}</td>
        <td class="flashcards-cell cell-learned">${learned}</td>
        <td class="flashcards-cell cell-delete"></td>
    `

    const deleteButton = document.createElement('button')
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = async () => {
        try {
            const resp = await fetch(`/api/cards/${id}`, {
                method: 'DELETE',
            })

            if (!resp.ok) {
                throw new Error("Unable to delete")
            }

        } catch (e) {
            return console.error(e)
        }

        row.remove()
    }

    row.querySelector('td.cell-delete').append(deleteButton)

    return row;
}