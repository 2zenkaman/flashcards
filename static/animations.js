export default function handleFlipAnimation(when) {
    return (ev) => {
        const enabled = typeof when === 'function' ? when() : when
        if (!enabled) return

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