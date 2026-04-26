"use strict";

import Preview from "./preview.js";

import handleFlipAnimation from "./animations.js";
import {postCard, deleteCard, switchLearned, getCards} from "./api.js"

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

let cards = {
    deck: [],

    render() {
        const table = document.querySelector('#flashcards-deck > tbody')
        table.innerHTML = ''

        this.deck.forEach(c => {
            const row = c.toElement(
                handleDelete(c.id), 
                handleEdit(c.id), 
                handleSwitch(c.id)
            )
            table.appendChild(row)
        })
    },

    push(c) {
        this.deck.push(c)

        const table = document.querySelector('#flashcards-deck > tbody')

        const row = c.toElement(
            handleDelete(c.id), 
            handleEdit(c.id), 
            handleSwitch(c.id)
        )
        table.appendChild(row)
    },
}

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

    // preserve the fucking form cause it is somehow lost after submit and I have no idea why, so I have to query it again
    const form = ev.currentTarget

    const req = {
        question: document.querySelector('form input[name="question"]').value.trim(),
        answer:   document.querySelector('form input[name="answer"]').value.trim(),
    }

    try {
        const new_card = await postCard(req)

        cards.push(new_card)
        learnData.deck = selectLearnable(cards)

        // preserve learned state from edited card
        if (editingCard) {
            new_card.learned = editingCard.learned
            editingCard = null
        }

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
            // delete card on server
            await deleteCard(id)

            // delete card locally by id
            cards = cards.filter(c => c.id !== id)
            learnData.deck = selectLearnable(cards)

            // fix index if it's out of bounds
            if (learnData.p >= learnData.deck.length && learnData.deck.length > 0) {
                learnData.p = learnData.deck.length - 1
            }

            updateLearnState()

            // removes row in html
            getRow(id).remove()

        } catch (e) {
            return console.error(e)
        }
    }
}

const handleEdit = (id) => {
    return async (ev) => {
        const editButton = ev.currentTarget
        document.querySelector('form input[name="question"]').value = editButton.closest('tr').querySelector('td.cell-question').textContent.trim()
        document.querySelector('form input[name="answer"]').value = editButton.closest('tr').querySelector('td.cell-answer').textContent.trim()

        // save the editing card to preserve its learned state
        editingCard = cards.find(c => c.id === id)

        try {
            await deleteCard(id)

            // delete card locally by id
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

const handleSwitch = (id) => {
    return async () => {
        try {
            const data = await switchLearned(id)

            // switch learned state locally by id
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
        cards = await getCards()
        learnData.deck = selectLearnable(cards)

        cards.render()

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