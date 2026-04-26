"use strict";

import Preview from "./preview.js";

import {Deck, PointedDeck} from "./decks.js";

import handleFlipAnimation from "./animations.js";
import { postCard, deleteCard, switchLearned, getCards } from "./api.js"
import { postDeck, getDecks, deleteDeck } from "./api.js";

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
let currentDeck = {
    id: null,
    name: null,
}

const updateStats = () => {
    document.querySelector('#total-cards').textContent = cards.data.length
    document.querySelector('#learned-cards').textContent = cards.data.filter(c => c.learned).length
    document.querySelector('#deck-name').textContent = currentDeck.name ? `(${currentDeck.name})` : ''
}

const action = ({pre, server, local, html} = {}, reset = false) => {
    return async (ev) => {
        if (pre) pre(ev)
        try {
            const data = server ? await server() : null
            if (local) local(data)
            if (html) html(data)
            
            learnData.data = selectLearnable(cards.data)
            learnData.normalize()
            updateLearnState()
            updateCounterState(learnData)

            updateStats()

            if (reset) {
                render(cards.data)
            } 
        } catch (e) {
            console.error(e)
        }
    }
}

const row = (c) => {
    return c.toElement({
        ondelete: action({
            server: async () => await deleteCard(c.id, c.deck_id),
            local: id => cards.remove(id),
            html: () => c.getElement().remove()
        }),
        onedit: action({
            pre: () => {
                const row = c.getElement()
                document.querySelector('form input[name="question"]').value = row.querySelector('td.cell-question').textContent.trim()
                document.querySelector('form input[name="answer"]').value = row.querySelector('td.cell-answer').textContent.trim()

                // save the editing card to preserve its learned state
                editingCard = c
            },
            server: async () => {
                await deleteCard(c.id, c.deck_id)
            },
            local: () => cards.remove(c.id),
            html: () => c.getElement().remove(),
        }),
        onswitch: action({
            server: async () => await switchLearned(c.id, c.deck_id),
            local: data => cards.flip(data.id),
            html: (data) => {
                c.getElement().dataset.learned = data.learned
                c.getElement().querySelector('.cell-learned').textContent = data.learned ? 'Learned' : 'Not learned'
            }
        })
    })
}

const deck = (d) => {
    return d.toElement({
        onselect: action({
            server: async () => await getCards(d.id),
            local: data => {
                currentDeck.id = d.id
                currentDeck.name = d.name
                cards.data = data
            },
            html: () => {
                // highlight the selected deck
                document.querySelectorAll('.side-panel .deck').forEach(s => s.dataset.selected = false)
                document.querySelector(`.side-panel .deck[data-deck_id="${d.id}"]`).dataset.selected = true
            },
        }, reset = true),
        ondelete: action({
            server: async () => await deleteDeck(d.id),
            html: () => d.getElement().remove()
        })
    })
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
    document.querySelector('#forward').disabled = learnData.data.length - learnData.p <= 1
}

const updateLearnState = () => {
    const windowElement = document.querySelector('#question-answer')
    if (learnData.data.length === 0) {
        windowElement.textContent = 'No cards to learn.'
    } else {
        windowElement.innerHTML = ''
        const preview = new Preview(learnData.current()).toElement()
        windowElement.append(preview)
    }

    updateButtonsState()
}

const updateCounterState = (data) => {
    document.querySelector('#counter').textContent = `${data.p + 1} / ${data.data.length}`
    document.querySelector('#counter').hidden = data.data.length === 0
}

const handleCardFormSubmition = action({
    pre: (ev) => ev.preventDefault(),
    server: async () => {
        const req = {
            question: document.querySelector('form input[name="question"]').value.trim(),
            answer:   document.querySelector('form input[name="answer"]').value.trim(),
        }

        return await postCard({deck_id: currentDeckID, ...req})
    },
    local: (data) => {
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

const handleNewDeckClick = action({
    html: () => {
        const item = document.querySelector('.panel-group .new-deck')
        if (item.querySelector('form')) return

        const input = document.createElement('input')
        input.type = 'text'

        const form = document.createElement('form')
        form.appendChild(input)

        form.onsubmit = action({
            pre: (ev) => ev.preventDefault(),
            server: async () => {
                if (input.value.trim() === '') return
                return await postDeck({name: input.value})
            },
            html: (data) => {
                item.innerHTML = `<div class="unselectable">New deck</div>`
                document.querySelector('.panel-group').appendChild(deck(data))
            }
        })

        item.querySelector('div').replaceWith(form)
        input.focus()
    }
})

window.onload = async () => {
    document.querySelectorAll('form input').forEach(i => i.value = '')

    action({
        server: async () => await getDecks(),
        html: (data) => {
            const panelGroup = document.querySelector('.panel-group')
            data.forEach(d => panelGroup.appendChild(deck(d)))
        }
    })()

    document.querySelector('.side-panel .new-deck').onclick = handleNewDeckClick
    document.querySelector('.head form').onsubmit = handleCardFormSubmition

    document.querySelector('#shuffle').onclick = action({
        local: () => cards.shuffle(),
        html: () => render(cards.data),
    })

    document.querySelector('#reset').onclick = action({
        local: () => cards.data.sort((a, b) => a.id - b.id),    
        html: () => render(cards.data),
    })

    // empty action updates the learnable deck and learn state, so it is used for checkboxes
    document.querySelector('input[name="not-learned"]').onclick = action()
    document.querySelector('input[name="learned"]').onclick = action()
    
    document.querySelector('#question-answer').onclick = handleFlipAnimation(() => learnData.data.length > 0)

    document.querySelector('#backward').onclick = action({
        local: () => learnData.backward(),
    })

    document.querySelector('#forward').onclick = action({
        local: () => learnData.forward(),
    })
}