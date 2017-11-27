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
            this.parseStatement();
        }
    }

    parseStatement() {
        const callee = this.parseId();
        const functionDefinition = this.ctx[callee];
        if (!functionDefinition || functionDefinition.type !== 'function') {
            throw new Error(`Function ${callee} not defined`)
        }
        const parameters = this.parseParameters(functionDefinition.signature);
        functionDefinition.definition.apply(this.runtime, parameters);
        this.match(';');
    }

    parseFunction() {
        const callee = this.parseId();
        const functionDefinition = this.ctx[callee];
        if (!functionDefinition || functionDefinition.type !== 'function') {
            throw new Error(`Function ${callee} not defined`)
        }
        const parameters = this.parseParameters(functionDefinition.signature);
        functionDefinition.definition.apply(this.runtime, parameters);
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
            if (this.isStatic(value)) {
                if (!methodDefinition.static) {
                    throw Error('Can not call a instance method as a static method');
                }
                value = methodDefinition.definition.apply(this.runtime, parameters);
            } else {
                if (methodDefinition.static) {
                    throw Error('Can not call a static method as a instance method');
                }
                value = methodDefinition.definition.apply(this.runtime, [value].concat(parameters));
            }
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
            while (this.nextToken.type === ',') {
                this.match(',');
                parameters.push(this.parseMessage());
            }
        }
        this.match(')');
        if (parameters.length !== signature.length) {
            throw Error(`Expected ${signature.length} parameters, got ${parameters.length}`);
        }
        for (let i = 0; i < parameters.length; ++i) {
            const paramType = this.getType(parameters[i]).name;
            if (paramType !== signature[i]) {
                throw Error(`Expected parameter ${i + 1} with type ${signature[i]} got type ${paramType}`);
            }
        }
        return parameters;
    }

    parseValue() {
        switch (this.nextToken.type) {
            case 'string':
            case 'number':
            case 'boolean':
                break;
            case 'id':
                const name = this.parseId();
                if (!this.ctx[name]) {
                    throw new Error(`Name ${name} not declared`);
                }
                return this.ctx[name];
            case '(':
                this.match('(');
                const value = this.parseMessage();
                this.match(')');
                return value;
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

    getType(value) {
        const rawType = typeof value;
        switch (rawType) {
            case 'number':
            case 'string':
            case 'boolean':
                return this.ctx[rawType]
            case 'object':
                if (value.type === 'type') {
                    return value;
                }
        }
        throw Error(`Unknown type ${typeof value}`);
    }

    isStatic(operand) {
        const rawType = typeof operand;
        switch (rawType) {
            case 'number':
            case 'string':
            case 'boolean':
                return false;
            case 'object':
                if (operand.type === 'type') {
                    return true;
                }
        }
        throw Error(`Unknown type ${typeof operand}`);
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
