"use strict";

import Preview from "./preview.js";

import {Deck, PointedDeck} from "./deck.js";

import handleFlipAnimation from "./animations.js";
import {postCard, deleteCard, switchLearned, getCards} from "./api.js"

const learnData = new PointedDeck()
const cards = new Deck()

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

const row = (c) => {
    return c.toElement(
        action(c.id, {
            server: deleteCard,
            local: id => cards.remove(id),
            html: (row) => row.remove()
        }),
        action(c.id, {
            pre: () => {
                const row = getRow(c.id)
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
    document.querySelector('#forward').disabled = learnData.deck.length - learnData.p <= 1
}

const updateLearnState = () => {
    const windowElement = document.querySelector('#flashcards-window')
    if (learnData.deck.length === 0) {
        windowElement.textContent = 'No cards to learn.'
    } else {
        windowElement.innerHTML = ''
        const preview = new Preview(learnData.current()).toElement()
        windowElement.append(preview)
    }

    updateButtonsState()
}

const updateCounterState = (data) => {
    document.querySelector('#counter').textContent = `${data.p + 1} / ${data.deck.length}`
    document.querySelector('#counter').hidden = data.deck.length === 0
}

// on every state update
const post = () => {
    learnData.deck = selectLearnable(cards.deck)
    learnData.normalize()
    updateLearnState()
    updateCounterState(learnData)
}

const action = (id = null, {pre, server, local, html} = {}) => {
    return async (ev) => {
        if (pre) pre(ev)
        try {
            const data = server ? await server(id) : null

            if (local) local(id, data)

            const row = getRow(id)
            if (html) html(row, data)

            post()
        } catch (e) {
            console.error(e)
        }
    }
}

const handleFormSubmition = action(null, {
    pre: (ev) => ev.preventDefault(),
    server: async () => {
        const req = {
            question: document.querySelector('form input[name="question"]').value.trim(),
            answer:   document.querySelector('form input[name="answer"]').value.trim(),
        }

        return await postCard(req)
    },
    local: (id, data) => {
        cards.push(data)
        
        if (editingCard) {
            data.learned = editingCard.learned
            editingCard = null
        }
    },
    html: () => {
        document.querySelectorAll('form input').forEach(i => i.value = '')
        document.querySelector('#flashcards-deck > tbody').appendChild(row(cards.last()))
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

    document.querySelector('#shuffle').onclick = action(null, {
        local: () => cards.shuffle(),
        html: () => render(cards.deck),
    })

    document.querySelector('#reset').onclick = action(null, {
        local: () => cards.deck.sort((a, b) => a.id - b.id),    
        html: () => render(cards.deck),
    })

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