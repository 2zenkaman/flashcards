export default class Preview {
    question
    answer
    learned

    constructor({question, answer, learned}) {
        this.question = question
        this.answer = answer
        this.learned = learned
    }

    toElement() {
        const prewiew = document.createElement('div')
        prewiew.className = 'window unselectable centered'
        prewiew.dataset.learned = this.learned
        prewiew.innerHTML = `
            <div>Question: ${this.question}</div>
            <div hidden>Answer: ${this.answer}</div>
        `

        return prewiew
    }
}