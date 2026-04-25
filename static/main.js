"use strict";

import Window from "./learn.js";
import Card from "./card.js";

const form = document.querySelector('form')
const deck = document.querySelector('#flashcards-deck > tbody')
const windowElement = document.querySelector('#flashcards-window')

const inputNotLearned = document.querySelector('input[name="not-learned"]')
const inputLearned = document.querySelector('input[name="learned"]')

let cards = []
let learnDeck = []
let p = 0

const getRow = (id) => {
    let row
    document.querySelectorAll('tr.flashcards-row').forEach(s => {
        if (s.querySelector('.cell-id').innerHTML == id) {
            row = s
        }
    })

    return row
}

const selectLearnable = (cards) => {
    return cards.filter(c => {
        if (inputLearned.checked === false && inputNotLearned.checked === false) return false;
        return c.learned === inputLearned.checked | c.learned === !inputNotLearned.checked
    })
}

window.onload = async () => {
    document.querySelectorAll('form input').forEach(i => i.value = '')

    try {
        const resp = await fetch('/api/cards')
        const data = await resp.json()

        if (!resp.ok) {
            throw new Error(data.error)
        }
        
        data.forEach(c => cards.push(new Card(c)))
        learnDeck = selectLearnable(cards)

        cards.forEach(c => {
            const row = c.toElement(handleDelete(c.id), handleEdit(c.id), handleSwitch(c.id))
            deck.appendChild(row)
        })

        if (learnDeck.length === 0) {
            windowElement.textContent = 'No cards'
        } else {
            windowElement.append(Window(learnDeck[p]))
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

        // temporary variable to track the edited card's state
        const learned_temp = form.dataset.learned_temp
        if (learned_temp !== 'null') {
            data.learned = learned_temp
            form.dataset.learned_temp = 'null'
        }

        const new_card = new Card(data)

        cards.push(new_card)
        learnDeck = selectLearnable(cards)

        if (learnDeck.length === 1) {
            windowElement.innerHTML = ''
            windowElement.append(Window(learnDeck[p]))
        }

        const row = new_card.toElement(handleDelete(new_card.id), handleEdit(new_card.id), handleSwitch(new_card.id))
        deck.appendChild(row)

        form.querySelectorAll('input').forEach(i => i.value = '')
    } catch (e) {
        console.error(e)
        return
    }
}

document.querySelector('#backward').onclick = () => {
    if (learnDeck.length <= 1) return;
    p = (((p - 1) % learnDeck.length) + learnDeck.length) % learnDeck.length
    windowElement.innerHTML = ''
    windowElement.append(Window(learnDeck[p]))
}

document.querySelector('#forward').onclick = () => {
    if (learnDeck.length <= 1) return;
    p = (p + 1) % learnDeck.length
    windowElement.innerHTML = ''
    windowElement.append(Window(learnDeck[p]))
}

const handleDelete = (id) => {
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
                windowElement.append(Window(learnDeck[p]))
            }

            // removes row
            getRow(id).remove()

        } catch (e) {
            return console.error(e)
        }
    }
}

const handleEdit = (id) => {
    return async (ev) => {
        document.querySelector('form input[name="question"]').value = ev.currentTarget.parentElement.parentElement.querySelector('td.cell-question').textContent.trim()
        document.querySelector('form input[name="answer"]').value = ev.currentTarget.parentElement.parentElement.querySelector('td.cell-answer').textContent.trim()

        const row = getRow(id)

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

        // removes row
        getRow(id).remove()
    }
}

const handleSwitch = (id) => {
    return async () => {
        try {
            const resp = await fetch(`/api/cards/${id}`, {
                method: 'PUT',
            })

            const data = await resp.json();

            if (!resp.ok) {
                throw new Error(data.error)
            }

            cards.forEach((c, i, a) => {
                if (c.id === id) a[i].learned = data.learned
            })

            // find row
            const row = getRow(id)

            row.dataset.learned = data.learned
            row.querySelector('.cell-learned').textContent = data.learned ? 'Learned' : 'Not learned'

            learnDeck = selectLearnable(cards)
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
        p = 0
        windowElement.append(Window(learnDeck[p]))
    }
}

document.querySelector('input[name="not-learned"]').onclick = handleSelectMode
document.querySelector('input[name="learned"]').onclick = handleSelectMode

document.querySelector('div#flashcards-window').onclick = (ev) => {
    const window = ev.currentTarget.querySelector('div.window')
    window.classList.toggle('active')

    setTimeout(() => {
        window.classList.toggle('active')
        window.childNodes.forEach(c => {
            c.hidden = !c.hidden
        })
    }, 150);
}