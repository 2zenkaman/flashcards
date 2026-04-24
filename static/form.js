"use strict";

import Row from "./row.js";

const form = document.querySelector('form')
const deck = document.querySelector('#flashcards-deck > tbody')

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

        deck.appendChild(Row(data))

        form.querySelectorAll('input').forEach(i => i.value = '')
    } catch (e) {
        console.error(e)
        return
    }
}