class PointedDeck {
    deck = []
    p = 0

    constructor() {
        this.deck = []
        this.p = 0
    }
    
    current() {
        return this.deck[this.p]
    }
    
    forward() {
        if (this.p < this.deck.length - 1) this.p++
    }
    
    backward() {
        if (this.p > 0) this.p--
    }

    normalize() {
        if (this.p >= this.deck.length) this.p = this.deck.length - 1
        if (this.p < 0) this.p = 0
    }
}