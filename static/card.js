export default class Card {
    id
    deck_id
    question
    answer
    learned

    constructor({id, deck_id, question, answer, learned}) {
        this.id = id
        this.deck_id = deck_id
        this.question = question
        this.answer = answer
        this.learned = learned
    }

    toElement({ondelete, onedit, onswitch}) {
        const row = document.createElement('tr')
        row.classList.add('flashcards-row')
        row.dataset.learned = this.learned
        row.innerHTML = `
            <td class="flashcards-cell cell-id centered">${this.id}</td>
            <td class="flashcards-cell cell-question">${this.question}</td>
            <td class="flashcards-cell cell-answer">${this.answer}</td>
            <td class="flashcards-cell cell-learned centered unselectable">${this.learned ? 'Learned' : 'Not learned'}</td>
            <td class="flashcards-cell cell-edit centered unselectable">Edit</td>
            <td class="flashcards-cell cell-delete centered unselectable">Delete</td>
        `

        row.querySelector('td.cell-delete').onclick = ondelete
        row.querySelector('td.cell-edit').onclick = onedit
        row.querySelector('td.cell-learned').onclick = onswitch

        return row;
    }
}