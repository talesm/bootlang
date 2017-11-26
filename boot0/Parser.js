const Tokenizer = require('./Tokenizer')
const builtin = require('./builtin')

exports = module.exports = class Parser {
    constructor(text, runtime) {
        this.tokenizer = new Tokenizer(text);
        this.runtime = runtime;
        this.next();
        this.ctx = Object.create(builtin);
    }

    parse() {
        while (this.nextToken !== null) {
            const callee = this.parseId();
            if (!this.runtime[callee]) {
                throw new Error(`Function ${callee} not defined`)
            }
            this.match('(');
            const param = this.parseMessage();
            this.runtime[callee](param);
            this.match(')');
            this.match(';');
        }
    }

    parseMessage() {
        let value = this.parseValue();
        while (this.nextToken.type === '.') {
            const valueTypeDefinition = this.getType(value);
            this.match('.');
            const method = this.parseId();
            const methodDefinition = valueTypeDefinition.methods[method]
            if (!valueTypeDefinition.methods[method]) {
                throw new Error(`Invalid method '${method}()' for type ${valueTypeDefinition.name}`);
            }
            this.match('(');
            this.match(')');
            value = methodDefinition.definition(value);
        }
        return value;
    }

    getType(value) {
        const valueType = typeof value;
        return this.ctx[valueType];
    }

    parseValue() {
        switch (this.nextToken.type) {
            case 'string':
            case 'number':
            case 'boolean':
                break;
            default:
                throw new Error(`Expected value, got ${this.nextToken.type}`);
        }
        return this.next().value;
    }

    parseId() {
        return this.match('id').value;
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
