import Card from "./card.js";

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

    return data.learned
}