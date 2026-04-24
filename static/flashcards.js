"use strict";

document.querySelector('form').onsubmit = async (ev) => {
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

        refreshTable();
    } catch (e) {
        return
    }
}