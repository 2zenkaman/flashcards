export default function Window({question, answer, learned}) {
    const window = document.createElement('div')
    window.className = 'window unselectable centered'
    window.dataset.learned = learned
    window.innerHTML = `
        <div>${question}</div>
        <div hidden>${answer}</div>
    `

    window.onclick = () => {
        window.childNodes.forEach(c => {
            c.hidden = !c.hidden
        })
    }

    return window
}