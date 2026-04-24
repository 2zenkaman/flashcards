"use strict";

import Row from "./row.js";

const form = document.querySelector('form')
const deck = document.querySelector('#flashcards-deck')

// document.querySelector('form').addEventListener('submit', (ev) => {})
form.onsubmit = async (ev) => {
    ev.preventDefault()

    const card = {
        question: document.querySelector('form > input[name="face"]').value,
        answer:   document.querySelector('form > input[name="back"]').value,
    }

    try {
        const resp = await fetch('/api/cards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(card),
        })

        if (!resp.ok) {
            throw new Error(resp.statusText)
        }

        const card = await resp.json();

        deck.appendChild(Row(card))
    } catch (e) {
        return
    }
}