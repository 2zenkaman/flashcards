"use strict";

import Row from "./row.js"
import Window from "./learn.js";

const form = document.querySelector('form')
const deck = document.querySelector('#flashcards-deck > tbody')
const windowElement = document.querySelector('#flashcards-window')

const backward = document.querySelector('#backward')
const forward = document.querySelector('#forward')

let cards = []
let pointer = 0

window.onload = async () => {
    document.querySelector('form').querySelectorAll('input').forEach(i => i.value = '')

    try {
        const resp = await fetch('/api/cards')
        const data = await resp.json()

        if (!resp.ok) {
            throw new Error(data.error)
        }

        cards = data

        cards.forEach(c => deck.appendChild(Row(c)))

        if (cards.length === 0) {
            windowElement.textContent = 'No cards'
        } else {
            windowElement.append(Window(cards[pointer]))
        }
    } catch (e) {
        console.error(e)
    }
}

// document.querySelector('form').addEventListener('submit', (ev) => {...})
form.onsubmit = async (ev) => {
    ev.preventDefault()

    const req = {
        question: document.querySelector('form input[name="question"]').value,
        answer:   document.querySelector('form input[name="answer"]').value,
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
        }

        cards.push(data)

        if (cards.length === 1) {
            windowElement.innerHTML = ''
            windowElement.append(Window(cards[pointer]))
        }

        deck.appendChild(Row(data))

        form.querySelectorAll('input').forEach(i => i.value = '')
    } catch (e) {
        console.error(e)
        return
    }
}

backward.onclick = () => {
    pointer = (((pointer - 1) % cards.length) + cards.length) % cards.length
    windowElement.innerHTML = ''
    windowElement.append(Window(cards[pointer]))
}

forward.onclick = () => {
    pointer = (pointer + 1) % cards.length
    windowElement.innerHTML = ''
    windowElement.append(Window(cards[pointer]))
}

function Row({id, question, answer, learned}) {
    const row = document.createElement('tr')
    row.className = "flashcards-row"
    row.dataset.learned = learned
    row.innerHTML = `
        <td class="flashcards-cell cell-id">${id}</td>
        <td class="flashcards-cell cell-question">${question}</td>
        <td class="flashcards-cell cell-answer">${answer}</td>
        <td class="flashcards-cell cell-learned"></td>
        <td class="flashcards-cell cell-edit"></td>
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
                const data = await resp.json()
                throw new Error(data.error)
            }

            row.remove()

        } catch (e) {
            return console.error(e)
        }
    }
    row.querySelector('td.cell-delete').append(deleteButton)

    const editButton = document.createElement('button')
    editButton.textContent = 'Edit'
    editButton.onclick = async () => {
        document.querySelector('form input[name="question"]').value = question
        document.querySelector('form input[name="answer"]').value = answer

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
    row.querySelector('td.cell-edit').append(editButton)

    const switchButton = document.createElement('button')
    switchButton.textContent = learned ? 'Not learned' : 'Learned'
    switchButton.onclick = async () => {
        try {
            const resp = await fetch(`/api/cards/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    question,
                    answer,
                    learned: row.dataset.learned === 'true' ? false : true,
                })
            })

            const data = await resp.json();

            if (!resp.ok) {
                throw new Error(data.error)
            }

            row.dataset.learned = data.learned

            switchButton.textContent = data.learned ? 'Not learned' : 'Learned'
        } catch (e) {
            console.error(e)
        }
    }
    row.querySelector('td.cell-learned').append(switchButton)

    return row;
}