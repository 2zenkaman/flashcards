export default class Deck {
    id
    name
    
    constructor({id, name}) {
        this.id = id
        this.name = name
    }

    toElement({onselect, ondelete}) {
        const preview = document.createElement('div')
        preview.classList.add('deck', 'unselectable')
        preview.dataset.deck_id = this.id
        preview.dataset.selected = false
        preview.innerHTML = `
            <div>${this.name}</div>
            <div class="cell-delete centered unselectable">Delete</div>
        `

        preview.onclick = onselect
        preview.querySelector('.cell-delete').onclick = ondelete
    
        return preview
    }

    getElement() {
        return document.querySelector(`.side-panel .deck[data-deck_id="${this.id}"]`)
    }
}