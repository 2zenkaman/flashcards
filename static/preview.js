export default class Preview {
    question
    answer

    constructor({question, answer}) {
        this.question = question
        this.answer = answer
    }

    toElement() {
        const prewiew = document.createElement('div')
        prewiew.className = 'window unselectable centered'
        prewiew.innerHTML = `
            <div>Question: ${this.question}</div>
            <div hidden>Answer: ${this.answer}</div>
        `

        return prewiew
    }
}