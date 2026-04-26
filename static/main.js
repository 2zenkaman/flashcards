"use strict";

import Preview from "./preview.js";

import handleFlipAnimation from "./animations.js";
import {postCard, deleteCard, switchLearned, getCards} from "./api.js"

const vault = {
    question: null,
    answer: null,

    save(question, answer) {
        this.question = question
        this.answer = answer
    },
}

const learnData = {
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

const cards = {
    deck: [],

    remove(id) {
        this.deck = this.deck.filter(c => c.id !== id)
    },

    flip(id) {
        this.deck.forEach((c, i, a) => {
            if (c.id === id) a[i].learned = !a[i].learned
        })
    },

    find(id) {
        return this.deck.find(c => c.id === id)
    },
 
    push(c) {
        this.deck.push(c)
    },
}

const render = (cardList) => {
    const table = document.querySelector('#flashcards-deck > tbody')
    table.innerHTML = ''

    cardList.forEach(c => {
        table.appendChild(row(c))
    })
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

const row = (id) => {
    return c.toElement(
        action(c.id, {
            server: deleteCard,
            local: id => cards.remove(id),
            html: (row) => row.remove()
        }),
        action(c.id, {
            pre: () => {
                document.querySelector('form input[name="question"]').value = row.querySelector('td.cell-question').textContent.trim()
                document.querySelector('form input[name="answer"]').value = row.querySelector('td.cell-answer').textContent.trim()

                // save the editing card to preserve its learned state
                editingCard = cards.find(c => c.id === id)
            },
            server: deleteCard,
            local: id => cards.remove(id),
            html: (row) => row.remove()
        }),
        action(c.id, {
            server: switchLearned,
            local: id => cards.flip(id),
            html: (row, data) => {
                row.dataset.learned = data.learned
                row.querySelector('.cell-learned').textContent = data.learned ? 'Learned' : 'Not learned'
            }
        })
    )
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

const action = (id = null, {pre, server, local, html} = {}) => {
    return async (ev) => {
        if (pre) pre(ev)
        try {
            const data = server ? await server(id) : null

            if (local) {
                local(id, data)
            }

            const row = getRow(id)

            if (html) {
                html(row, data)
            }

            learnData.deck = selectLearnable(cards.deck)

            updateLearnState()
        } catch (e) {
            console.error(e)
        }
    }
}

const handleFormSubmition = action(null, {
    pre: (ev) => {
        ev.preventDefault()

        const form = ev.currentTarget

        const req = {
            question: form.querySelector('input[name="question"]').value.trim(),
            answer:   form.querySelector('input[name="answer"]').value.trim(),
        }

        vault.save(req.question, req.answer)
    },
    server: async () => await postCard(vault),
    local: (id, data) => {
        cards.push(data)
        
        if (editingCard) {
            data.learned = editingCard.learned
            editingCard = null
        }
    },
    html: () => {
        document.querySelectorAll('form input').forEach(i => i.value = '')
        document.querySelector('#flashcards-deck > tbody').appendChild(row(cards.deck[cards.deck.length - 1]))
    },
})

window.onload = async () => {
    document.querySelectorAll('form input').forEach(i => i.value = '')

    action(null, {
        server: async () => await getCards(),
        local: (id, data) => cards.deck = data,
        html: () => render(cards.deck),
    })()

    document.querySelector('form').onsubmit = handleFormSubmition

    // empty action updates the learnable deck and learn state, so it is used for checkboxes
    document.querySelector('input[name="not-learned"]').onclick = action()
    document.querySelector('input[name="learned"]').onclick = action()
    
    document.querySelector('#flashcards-window').onclick = handleFlipAnimation(() => learnData.deck.length > 0)

    document.querySelector('#backward').onclick = action(null, {
        local: () => learnData.decrement(),
    })

    document.querySelector('#forward').onclick = action(null, {
        local: () => learnData.increment(),
    })
}