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