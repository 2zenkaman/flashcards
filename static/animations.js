export default function handleFlipAnimation(when) {
    return (ev) => {
        if (!when()) return

        const window = ev.currentTarget.querySelector('div.window')
        window.classList.toggle('active')

        setTimeout(() => {
            window.classList.toggle('active')
            window.childNodes.forEach(c => {
                c.hidden = !c.hidden
            })
        }, 150);
    }
}