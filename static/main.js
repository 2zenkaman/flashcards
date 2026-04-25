"use strict";

import Card from "./card.js";
import Preview from "./preview.js";

import handleFlipAnimation from "./animations.js";

let learnData = {
    deck: [],
    p: 0,

    current() {
        return this.deck[this.p]
    },

    decrement() {
        this.p = (((this.p - 1) % this.deck.length) + this.deck.length) % this.deck.length
    },

    increment() {
        this.p = (this.p + 1) % this.deck.length
    },
}

let cards = []
let editingCard = null

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
    const inputNotLearned = document.querySelector('input[name="not-learned"]')
    const inputLearned = document.querySelector('input[name="learned"]')
    
    return cards.filter(c => {
        if (inputLearned.checked === false && inputNotLearned.checked === false) return false;
        return c.learned === inputLearned.checked || c.learned !== inputNotLearned.checked
    })
}

const updateButtonsState = () => {
    document.querySelector('#backward').disabled = learnData.p === 0
    document.querySelector('#forward').disabled = learnData.p === learnData.deck.length - 1
}

const updateLearnState = (reset = false) => {
    const windowElement = document.querySelector('#flashcards-window')
    if (learnData.deck.length === 0) {
        windowElement.textContent = 'No cards'
    } else {
        if (reset) learnData.p = 0
        windowElement.innerHTML = ''
        const preview = new Preview(learnData.current()).toElement()
        windowElement.append(preview)
    }

    updateButtonsState()
}

const handleFormSubmition = async (ev) => {
    ev.preventDefault()

    const form = ev.currentTarget

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

        // preserve learned state from edited card
        if (editingCard) {
            data.learned = editingCard.learned
            editingCard = null
        }

        const new_card = new Card(data)

        cards.push(new_card)
        learnData.deck = selectLearnable(cards)

        updateLearnState()

        const row = new_card.toElement(
            handleDelete(new_card.id), 
            handleEdit(new_card.id), 
            handleSwitch(new_card.id)
        )
        document.querySelector('#flashcards-deck > tbody').appendChild(row)

        // clears inputs after card submition
        form.querySelectorAll('input').forEach(i => i.value = '')

    } catch (e) {
        return console.error(e)
    }
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
            learnData.deck = selectLearnable(cards)

            // fix index if it's out of bounds
            if (learnData.p >= learnData.deck.length && learnData.deck.length > 0) {
                learnData.p = learnData.deck.length - 1
            }

            updateLearnState()

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

        // save the editing card to preserve its learned state
        editingCard = cards.find(c => c.id === id)

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

        updateButtonsState()
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

            learnData.deck = selectLearnable(cards)

            updateButtonsState()
        } catch (e) {
            console.error(e)
        }
    }
}

const handleSelectMode = () => {
    learnData.deck = selectLearnable(cards)
    updateLearnState(true)
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
        learnData.deck = selectLearnable(cards)

        cards.forEach(c => {
            const row = c.toElement(
                handleDelete(c.id),
                handleEdit(c.id),
                handleSwitch(c.id)
            )
            document.querySelector('#flashcards-deck > tbody').appendChild(row)
        })

        updateLearnState()

    } catch (e) {
        console.error(e)
    }

    document.querySelector('form').onsubmit = handleFormSubmition
    document.querySelector('input[name="not-learned"]').onclick = handleSelectMode
    document.querySelector('input[name="learned"]').onclick = handleSelectMode
    document.querySelector('#flashcards-window').onclick = handleFlipAnimation(() => learnData.deck.length > 0)

    document.querySelector('#backward').onclick = () => {
        learnData.decrement()
        updateLearnState()
    }
    document.querySelector('#forward').onclick = () => {
        learnData.increment()
        updateLearnState()
    }
}