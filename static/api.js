import Card from "./card.js";
import Deck from "./deck.js";

export async function postCard({question, answer}) {
    const resp = await fetch('/api/cards', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({question, answer})
    })

    const data = await resp.json()

    if (!resp.ok) {
        throw new Error(data.error)
    }

    return new Card(data)
}

export async function getCards() {
    const resp = await fetch('/api/cards')

    const data = await resp.json()

    if (!resp.ok) {
        throw new Error(data.error)
    }

    return data.map(c => new Card(c))
}

export async function deleteCard(id) {
    const resp = await fetch(`/api/cards/${id}`, {
        method: 'DELETE',
    })

    if (!resp.ok) {
        const data = await resp.json()
        throw new Error(data.error)
    }
}

export async function switchLearned(id) {
    const resp = await fetch(`/api/cards/${id}`, {
        method: 'PUT',
    })

    const data = await resp.json()

    if (!resp.ok) {
        throw new Error(data.error)
    }

    return new Card(data)
}



export async function postDeck({name}) {
    const resp = await fetch('/api/decks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({name})
    })

    const data = await resp.json()

    if (!resp.ok) {
        throw new Error(data.error)
    }

    return new Deck(data)
}

export async function getDecks() {
    const resp = await fetch('/api/decks')

    const data = await resp.json()

    if (!resp.ok) {
        throw new Error(data.error)
    }

    return data.map(d => new Deck(d))
}