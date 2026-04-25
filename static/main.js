"use strict";

import Window from "./learn.js";

const form = document.querySelector('form')
const deck = document.querySelector('#flashcards-deck > tbody')
const windowElement = document.querySelector('#flashcards-window')

const backward = document.querySelector('#backward')
const forward = document.querySelector('#forward')

const inputNotLearned = document.querySelector('input[name="not-learned"]')
const inputLearned = document.querySelector('input[name="learned"]')

let cards = []
let learnDeck = []
let pointer = 0

const selectLearnable = (cards) => {
    return cards.filter(c => {
        if (inputLearned.checked === false && inputNotLearned.checked === false) return false;
        return c.learned === inputLearned.checked | c.learned === !inputNotLearned.checked
    })
}

window.onload = async () => {
    document.querySelector('form').querySelectorAll('input').forEach(i => i.value = '')

    try {
        const resp = await fetch('/api/cards')
        const data = await resp.json()

        if (!resp.ok) {
            throw new Error(data.error)
        }
        
        cards = data
        learnDeck = selectLearnable(cards)

        cards.forEach(c => deck.appendChild(Row(c)))

        if (learnDeck.length === 0) {
            windowElement.textContent = 'No cards'
        } else {
            windowElement.append(Window(learnDeck[pointer]))
        }
    } catch (e) {
        console.error(e)
    }
}

// document.querySelector('form').addEventListener('submit', (ev) => {...})
form.onsubmit = async (ev) => {
    ev.preventDefault()

    const req = {
        question: document.querySelector('form input[name="question"]').value.trim(),
        answer:   document.querySelector('form input[name="answer"]').value.trim(),
    }

    try {
        const resp = await fetch('/api/cards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req),
        })

        const data = await resp.json()

        if (!resp.ok) {
            throw new Error(data.error)
        }

        const temp = form.dataset.learned_temp
        if (temp !== 'null') {
            data.learned = temp
            form.dataset.learned_temp = 'null'
        }

        cards.push(data)
        learnDeck = selectLearnable(cards)

        if (learnDeck.length === 1) {
            windowElement.innerHTML = ''
            windowElement.append(Window(learnDeck[pointer]))
        }

        deck.appendChild(Row(data))

        form.querySelectorAll('input').forEach(i => i.value = '')
    } catch (e) {
        console.error(e)
        return
    }
}

backward.onclick = () => {
    if (learnDeck.length <= 1) return;
    pointer = (((pointer - 1) % learnDeck.length) + learnDeck.length) % learnDeck.length
    windowElement.innerHTML = ''
    windowElement.append(Window(learnDeck[pointer]))
}

forward.onclick = () => {
    if (learnDeck.length <= 1) return;
    pointer = (pointer + 1) % learnDeck.length
    windowElement.innerHTML = ''
    windowElement.append(Window(learnDeck[pointer]))
}

function Row({id, question, answer, learned}) {
    const row = document.createElement('tr')
    row.className = "flashcards-row"
    row.dataset.learned = learned
    row.innerHTML = `
        <td class="flashcards-cell cell-id centered">${id}</td>
        <td class="flashcards-cell cell-question">${question}</td>
        <td class="flashcards-cell cell-answer">${answer}</td>
        <td class="flashcards-cell cell-learned centered unselectable">${learned ? 'Learned' : 'Not learned'}</td>
        <td class="flashcards-cell cell-edit centered unselectable">Edit</td>
        <td class="flashcards-cell cell-delete centered unselectable">Delete</td>
    `

    row.querySelector('td.cell-delete').onclick = handleDelete(row, id)
    row.querySelector('td.cell-edit').onclick = handleEdit(row, id)
    row.querySelector('td.cell-learned').onclick = handleSwitch(row, id)

    return row;
}

const handleDelete = (row, id) => {
    return async () => {
        try {
            const resp = await fetch(`/api/cards/${id}`, {
                method: 'DELETE',
            })

            if (!resp.ok) {
                const data = await resp.json()
                throw new Error(data.error)
            }

            // delete card by id
            cards = cards.filter(c => c.id !== id)
            learnDeck = selectLearnable(cards)

            if (learnDeck.length === 0) {
                windowElement.textContent = 'No cards'
            } else {
                windowElement.innerHTML = ''
                windowElement.append(Window(learnDeck[pointer]))
            }

            row.remove()

        } catch (e) {
            return console.error(e)
        }
    }
}

const handleEdit = (row, id) => {
    return async (ev) => {
        document.querySelector('form input[name="question"]').value = ev.currentTarget.parentElement.parentElement.querySelector('td.cell-question').innerHTML
        document.querySelector('form input[name="answer"]').value = ev.currentTarget.parentElement.parentElement.querySelector('td.cell-answer').innerHTML

        document.querySelector('form').dataset.learned_temp = row.dataset.learned

        try {
            const resp = await fetch(`/api/cards/${id}`, {
                method: 'DELETE',
            })

            if (!resp.ok) {
                const data = await resp.json()
                throw new Error(data.error)
            }

        } catch (e) {
            return console.error(e)
        }

        row.remove()
    }
}

const handleSwitch = (row, id) => {
    return async (ev) => {
        try {
            const resp = await fetch(`/api/cards/${id}`, {
                method: 'PUT',
            })

            const data = await resp.json();

            if (!resp.ok) {
                throw new Error(data.error)
            }

            cards.map((c, i, a) => {
                if (c.id === id) a[i].learned = data.learned
            })

            row.dataset.learned = data.learned
            ev.target.textContent = data.learned ? 'Learned' : 'Not learned'

            learnDeck = selectLearnable(cards)
            console.log(cards)
            console.log(learnDeck)
        } catch (e) {
            console.error(e)
        }
    }
}

// тварь
const handleSelectMode = () => {
    learnDeck = selectLearnable(cards)
    if (learnDeck.length === 0) {
        windowElement.textContent = 'No cards'
    } else {
        windowElement.innerHTML = ''
        pointer = 0
        windowElement.append(Window(learnDeck[pointer]))
    }
}

document.querySelector('input[name="not-learned"]').onclick = handleSelectMode
document.querySelector('input[name="learned"]').onclick = handleSelectMode

document.querySelector('div#flashcards-window').onclick = (ev) => {
    ev.target.firstChild.childNodes.forEach(c => {
        c.hidden = !c.hidden
    })
}