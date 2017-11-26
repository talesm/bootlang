const Tokenizer = require('./Tokenizer')

exports = module.exports = class Parser {
    constructor(text) {
        this.tokenizer = new Tokenizer(text);
    }

    parse() {
        this.match('writeln');
        this.match('(');
        this.match('\'Hello World\'');
        this.match(')');
        this.match(';');
        console.log('Hello World');
    }

    match(expected) {
        const received = this.tokenizer.next();
        if (expected !== received) {
            throw new Error(`Expected ${expected}, got ${received}`);
        }
    }
}
