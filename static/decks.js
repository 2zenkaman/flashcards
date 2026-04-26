export class Deck {
    data = []
    constructor() {
        this.data = []
    }

    remove(id) {
        this.data = this.data.filter(c => c.id !== id)
    }

    flip(id) {
        this.data.forEach((c, i, a) => {
            if (c.id === id) a[i].learned = !a[i].learned
        })
    }

    find(id) {
        return this.data.find(c => c.id === id)
    }

    push(c) {
        this.data.push(c)
    }

    last() {
        return this.data[this.data.length - 1]
    }

    shuffle() {
        for (let i = this.data.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.data[i], this.data[j]] = [this.data[j], this.data[i]];
        }
    }
}

export class PointedDeck extends Deck {
    p = 0

    constructor() {
        super()
        this.p = 0
    }
    
    current() {
        return this.data[this.p]
    }
    
    forward() {
        if (this.p < this.data.length - 1) this.p++
    }
    
    backward() {
        if (this.p > 0) this.p--
    }

    normalize() {
        if (this.p >= this.data.length) this.p = this.data.length - 1
        if (this.p < 0) this.p = 0
    }
}