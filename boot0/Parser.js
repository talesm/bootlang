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
            const parameters = this.parseParameters(methodDefinition.signature);
            value = methodDefinition.definition.apply(this.runtime, [value].concat(parameters));
        }
        return value;
    }

    /**
     * 
     * @param {string[]} signature 
     */
    parseParameters(signature) {
        const parameters = [];
        this.match('(');
        if (this.nextToken.type !== ')') {
            parameters.push(this.parseMessage());
        }
        this.match(')');
        return parameters;
    }

    getType(value) {
        const valueType = this.ctx[typeof value];
        if (!valueType) {
            throw Error(`Unknown type ${typeof value}`);
        }
        return valueType;
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
