"use strict";

import Row from "./row.js"

const deck = document.querySelector('#flashcards-deck > tbody')

window.onload = async () => {
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