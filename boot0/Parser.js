const Tokenizer = require('./Tokenizer')
const builtin = require('./builtin')

exports = module.exports = class Parser {
    constructor(tokens, runtime, ctx) {
        this.runtime = runtime;
        this.tokenizer = typeof tokens == 'object' ? tokens : new Tokenizer(tokens);
        this.next();
        this.ctx = Object.create(ctx || builtin);
    }

    parse() {
        while (this.nextToken !== null) {
            this.parseStatement();
        }
    }

    parseStatement() {
        const word = this.parseId();
        if (word === 'let') {
            const nextWord = this.parseId();
            const mutable = nextWord === 'mutable';
            const bindingName = mutable ? this.parseId() : nextWord;
            this.match('=');
            const value = this.parseMessage();
            if (this.ctx[bindingName]) {
                throw new Error('can not redeclare binding ' + bindingName)
            }
            this.ctx[bindingName] = {
                type: 'binding',
                valueType: this.getType(value),
                value,
                mutable,
            }
            this.match(';')
        } else if (word === 'if') {
            let condition = this.parseMessage();
            const block = this.parseBlock();
            const conditionType = this.getType(condition).name;
            if (conditionType !== 'boolean') {
                throw Error(`If condition should be a boolean, got ${conditionType}`);
            }
            if (!!condition) {
                block();
            }
            while (this.nextToken.type === 'id' && this.nextToken.value === 'else') {
                this.matchWord('else');
                if (this.nextToken.type === 'id' && this.nextToken.value === 'if') {
                    this.matchWord('if');
                    const elifCondition = this.parseCondition();
                    const block = this.parseBlock();
                    if (!condition && elifCondition()) {
                        block();
                        condition = true;
                    }
                } else {
                    const elseBlock = this.parseBlock();
                    if (!condition) {
                        elseBlock();
                    }
                    break;
                }
            }
            return 'conditional';
        } else if (this.nextToken.type == '=') {
            this.match('=');
            const value = this.parseMessage();
            const binding = this.ctx[word];
            if (!binding) {
                throw Error(`Variable ${word} not defined`);
            }
            const valueType = this.getType(value);
            if (valueType !== binding.valueType) {
                throw Error(`Assignment to ${word} expected ${binding.valueType.name}, got ${valueType.name}`);
            }
            binding.value = value;
            this.match(';')
        } else if (this.nextToken.type == '(') {
            const functionDefinition = this.ctx[word];
            if (!functionDefinition || functionDefinition.type !== 'function') {
                throw new Error(`Function ${word} not defined`)
            }
            const parameters = this.parseParameters(functionDefinition.signature);
            functionDefinition.definition.apply(this.runtime, parameters);
            this.match(';')
        } else {
            throw Error('Invalid Statement ' + word);
        }
    }

    parseCondition() {
        const tokensQueue = [];
        while (this.nextToken.type !== '{') {
            tokensQueue.push(this.next());
        }
        tokensQueue.push({ type: ';' });
        return () => {
            let pos = 0;
            const fakeTokenizer = {
                next() {
                    return tokensQueue[pos++];
                }
            }
            return new Parser(fakeTokenizer, this.runtime, this.ctx).parseMessage();
        };
    }

    parseBlock() {
        this.match('{');
        let openBlocks = 1;
        const tokensQueue = [];
        while (openBlocks > 0) {
            const token = this.next();
            tokensQueue.push(token);
            switch (this.nextToken.type) {
                case '{':
                    ++openBlocks;
                    break;
                case '}':
                    --openBlocks;
                    break;
            }
        }
        this.match('}');
        tokensQueue.push(null);

        return () => {
            let pos = 0;
            const fakeTokenizer = {
                next() {
                    return tokensQueue[pos++];
                }
            }
            return new Parser(fakeTokenizer, this.runtime, this.ctx).parse();
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
            case '(':
                this.match('(');
                const value = this.parseMessage();
                this.match(')');
                return value;
            case 'id':
                const name = this.parseId();
                const definition = this.ctx[name];
                if (!definition) {
                    throw new Error(`Name ${name} not declared`);
                }
                if (this.nextToken.type === '(') {
                    if (definition.type === 'function') {
                        const parameters = this.parseParameters(definition.signature);
                        return definition.definition.apply(this.runtime, parameters);
                    }
                    throw new Error(`Expected function, got ${definition.type}`);
                } else {
                    if (definition.type === 'type') {
                        return this.ctx[name];
                    }
                    if (definition.type === 'binding') {
                        return this.ctx[name].value;
                    }
                    throw new Error(`Expected type name or binding, got ${definition.type}`);
                }
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
                } else if (value.type === 'binding') {
                    return value.valueType;
                } else {
                    throw Error(`Invalid type ${value.type}`);
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
