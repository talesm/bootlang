const Tokenizer = require('./Tokenizer')

exports = module.exports = class Parser {
    constructor(text, runtime) {
        this.tokenizer = new Tokenizer(text);
        this.runtime = runtime;
        this.next();
    }

    parse() {
        while (this.nextToken !== null) {
            this.matchWord('writeln');
            this.match('(');
            this.runtime.writeln(this.parseString());
            this.match(')');
            this.match(';');
        }
    }

    parseString() {
        return this.match('string').value;
    }

    match(expected) {
        const received = this.next();
        if (expected !== received.type) {
            throw new Error(`Expected ${expected}, got ${received.type}`);
        }
        return received;
    }

    matchWord(expected) {
        const received = this.next();
        if (received.type !== 'id' || received.value !== expected) {
            throw new Error(`Expected ${expected}, got ${received.value}`);
        }
        return received;
    }

    next() {
        const token = this.nextToken;
        this.nextToken = this.tokenizer.next();
        return token;
    }
}
