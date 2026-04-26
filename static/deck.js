export default class Deck {
    id
    name
    
    constructor({id, name}) {
        this.id = id
        this.name = name
    }

    toElement() {
        const preview = document.createElement('div')
        preview.classList.add('deck')
        preview.dataset.deckId = this.id
        preview.dataset.selected = false
        preview.textContent = this.name
    
        return preview
    }
}