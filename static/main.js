"use strict";

import Row from "./row.js"

const form = document.querySelector('form')
const deck = document.querySelector('#flashcards-deck > tbody')

window.onload = async () => {
    document.querySelector('form').querySelectorAll('input').forEach(i => i.value = '')

    try {
        const resp = await fetch('/api/cards')
        const data = await resp.json()

        if (!resp.ok) {
            throw new Error(data.error)
        }

        data.forEach(c => deck.appendChild(Row(c)))
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

        deck.appendChild(Row(data))

        form.querySelectorAll('input').forEach(i => i.value = '')
    } catch (e) {
        console.error(e)
        return
    }
}