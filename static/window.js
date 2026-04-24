"use strict";

window.onload = async () => {
    try {
        const resp = await fetch('/api/cards')
        const cards = await resp.json()

        cards.forEach(c => deck.appendChild(Row(c)))
    } catch (e) {
        console.error(e)
    }
} 