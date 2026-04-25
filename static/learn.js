export default function Window({question, answer, learned}) {
    const window = document.createElement('div')
    window.className = 'window unselectable centered'
    window.dataset.learned = learned
    window.innerHTML = `
        <div>Question: ${question}</div>
        <div hidden>Answer: ${answer}</div>
    `

    return window
}