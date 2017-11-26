Numbers and booleans
====================

We that we have strings, we should add more types. Specifically numbers (here integers) and booleans. 
The first thing to do ia add support to them on our tokenizer:

Replace the pattern on Tokenizer class for this:
```js
/(?:\s|\/\*(?:[^\*]|\*[^\/])*\*\/)*(?:([\(\);\.,])|(true|false)|(\d+)|(\w+)|\'((?:[^\']|\'\')*)\')/y
```

(It **is** getting bigger and hard to read, but I think it still pratical).

Then replace the checkings on its `next()` method for this:

```js
if (result[1]) {
    return { type: result[1] };
}
if (result[2]) {
    return { type: 'boolean', value: result[2] === 'true' };
}
if (result[3]) {
    return { type: 'number', value: +result[3] }
}
if (result[4]) {
    return { type: 'id', value: result[4] };
}
if (result[5]) {
    return { type: 'string', value: result[5].replace(/''/g, "'") };
}
```

Now we have tokenizer support, but if you try to run something like `writeln(5);`, you will get an error like `Expected string, got number`, because we still need to add support for then on the parser. Remove the `parseString()` from the Parser and put the following in its place.

```js
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
```

Now everything works. Well, I didn't want to support function overload, but as we are dealing with javascript we kind of got it for free. I will solve it somewhat down this lesson. But for now we must think about operations. We do not have any of them, we just have constants. 

Operations
==========

When we talk about operations, we think about *operators* and while they're nice and I do want to have them in language, I don't think they are really necessary at this point. We can do the operations as functions, as we do have some support for them (just need more cases on a switch). But we can do little better and use it as **methods** or **messages** (depends of which OO school you are). Our goal is to enable the following code work:

```
writeln(5.add(2).invert().toString()); // '-7'
writeln(true.or(false).and(true).equals(true).toString()); // 'true'
writeln((5.add(2)).equals(3.add(4)).toStrin()); //'true'
```

This shows our initial methods. Each type has their own set within their own namespace. This is good, as we do not have to implement method overload without resorting to hacks like prefixing.

ToString()
----------

All types have a `toString()` method, so we begin with it. If you go back to init, you will see I already put the '.' on our tokenizer, so we can go straight to the parser:

First adjust the parser, on the parse method() and replacing the `const param = this.parseValue();` to `const param = this.parseMessage();`. Then create the parseMessage() method as follows:

```js
parseMessage() {
    const value = this.parseValue();
    if (this.nextToken.type === '.') {
        this.match('.');
        const method = this.parseId();
        this.match('(');
        this.match(')');
        if(method === 'toString'){
            return value.toString();
        }
        throw new Error(`Invalid method name ${method}`);
    } else {
        return value;
    }
}
```

Well, this is enough to just the toString(), but does not scale well. Almost all types support toString(), but other methods aren't that universal, so we should check the value's type and see if it support the method. Also is good to have that checking information in some sort of *context* object, that know the types and stuff. So we create the Built.js file with the content:

```js
exports.number = {
    type: 'type',
    methods: {
        toString: {
            type: 'function',
            signature: ['self'],
            returns: 'string',
            value: n => n.toString()
        }
    }
}

exports.boolean = {
    type: 'type',
    methods: {
        toString: {
            type: 'function',
            signature: ['self'],
            returns: 'string',
            value: n => n.toString()
        }
    }
}

exports.string = {
    type: 'type',
    methods: {
        toString: {
            type: 'function',
            signature: ['self'],
            returns: 'string',
            value: n => n
        }
    }
}
```

Then we require this file on our parser and append it to the ctor:
```js
var builtin = require('./builtin');

class Parser {
    constructor(tokenProvider) {
        //Previous stuff here
        this.ctx = Object.create(builtin);
    }
}
```

And finally change the parseMessage to:

```js
parseMessage() {
    let value = this.parseValue();
    while (this.nextToken.type === '.') {
        this.match('.');
        const method = this.parseId();
        this.match('(');
        this.match(')');
        const valueType = typeof value;
        const valueTypeDefinition = this.ctx[valueType];
        const methodDefinition = valueTypeDefinition.methods[method]
        if (methodDefinition) {
            if (methodDefinition.signature.length === 1 && methodDefinition.signature[0] === 'self') {
                value = methodDefinition.value(value);
            } else {
                throw new Error('Messages with number of parameters != 0 are not implemented yet.');
            }
        } else {
            throw new Error(`Invalid method '${method}()' for type ${valueType}`);
        }
    }
    return value;
}
```

Now that we have a generic way to add methods to types we can extend it to have the basic operations.

Boolean operations
------------------

The basic boolean operations are `and`, `or` and `not`. We also will implement an `equals`, just to be complete.

```js
methods: {
    toString: {
        type: 'function',
        signature: ['self'],
        returns: 'string',
        value: n => n.toString()
    },
    not: {
        type: 'function',
        signature: ['self'],
        returns: 'boolean',
        value: n => !n
    },
    and: {
        type: 'function',
        signature: ['self', 'boolean'],
        returns: 'boolean',
        value: (a, b) => a && b
    },
    or: {
        type: 'function',
        signature: ['self', 'boolean'],
        returns: 'boolean',
        value: (a, b) => a || b
    },
    equals: {
        type: 'function',
        signature: ['self', 'boolean'],
        returns: 'boolean',
        value: (a, b) => a === b
    }
}
```

But if you test, you will see a problem. We do not yet support messages with parameters, so only the not is actually working. To fix that edit the Parser.parseMessage and replace it as follows:

```js
parseMessage() {
    let value = this.parseValue();
    while (this.nextToken.type === '.') {
        this.match('.');
        const method = this.parseId();
        this.match('(');
        const parameters = [];
        if (this.nextToken.type !== ')') {
            parameters.push(this.parseMessage());
        }
        this.match(')');
        const valueType = typeof value;
        const valueTypeDefinition = this.ctx[valueType];
        const methodDefinition = valueTypeDefinition.methods[method]
        if (methodDefinition) {
            const signature = methodDefinition.signature;
            if (signature.length > 0 && signature[0] === 'self') {
                if (parameters.length + 1 !== signature.length) {
                    throw new Error(`Expected ${signature.length - 1} parameter(s), got ${parameters.length}`);
                }
                for (let i = 0; i < parameters.length; ++i) {
                    if (typeof parameters[i] !== signature[i + 1]) {
                        throw new Error(`Expected parameter ${i + 1} of type ${signature[i + 1]}, got ${typeof parameters[i]}`);
                    }
                }
                value = methodDefinition.value.apply(null, [value].concat(parameters));
            } else {
                throw new Error('Static messages not implemented yet.');
            }
        } else {
            throw new Error(`Found no such method '${method}()' for type ${valueType}`);
        }
    }
    return value;
}
```

Number operations
-----------------

The basic number operations we need to support are add, subtract, equals, lessThan and largerThan. Tecnically, with just lessThan() and using boolean operations we could achieve largerThan() and equals(), but let's not make it more painfull than necessary. 

```js
add: {
    type: 'function',
    signature: ['self', 'number'],
    returns: 'number',
    value: (a, b) => a + b,
},
sub: {
    type: 'function',
    signature: ['self', 'number'],
    returns: 'number',
    value: (a, b) => a - b,
},
equals: {
    type: 'function',
    signature: ['self', 'number'],
    returns: 'boolean',
    value: (a, b) => a === b
},
largerThan: {
    type: 'function',
    signature: ['self', 'number'],
    returns: 'boolean',
    value: (a, b) => a > b
},
lesserThan: {
    type: 'function',
    signature: ['self', 'number'],
    returns: 'boolean',
    value: (a, b) => a < b
}
``` 

Another good operation to have is a parse() method that transforms strings into numbers. We will also put it there. But this is a different kind of method. Instead of applying it on a number, we use it to **get** a number. We need a static methdod. If you look to the pattern, we will see that we reserved a space to put it, just by having the first parameter with a type other than 'self'. And so we add the two new methods:

```js
```

But it will not work yet, as we do not have any way to call it now. We must implement a way to call using the type instead of an instance, like this:

```blang
number.parseOrPanic('42');
```

How do we achieve this? Well fist we add that to parseValue's switch.
```js
case 'id':
    const name = this.parseId();
    if (!this.ctx[name]) {
        throw new Error(`Name ${name} not declared`);
    }
    return this.ctx[name];
```

Create the following method:
```js
getType(value) {
    const rawType = typeof value;
    switch (rawType) {
        case 'string':
        case 'number':
        case 'boolean':
            return [this.ctx[rawType], false];
        case 'object':
            if (value.type === 'type') {
                return [value, true];
            }
        default:
            throw new Error(`Unknown rawType ${rawType}`);
    }
}
```

And replace parserMessage();

```js
parseMessage() {
    let value = this.parseValue();
    while (this.nextToken.type === '.') {
        this.match('.');
        const method = this.parseId();
        this.match('(');
        const parameters = [];
        if (this.nextToken.type !== ')') {
            parameters.push(this.parseMessage());
        }
        this.match(')');
        const [valueTypeDefinition, isStatic] = this.getType(value);
        const methodDefinition = valueTypeDefinition.methods[method]
        if (methodDefinition) {
            const signature = methodDefinition.signature;
            if (isStatic) {
                if (signature.length > 0 && signature[0] === 'self') {
                    throw new Error(`Can not call non-static messages through type.`);
                }
                if (parameters.length !== signature.length) {
                    throw new Error(`Expected ${signature.length} parameter(s), got ${parameters.length}`);
                }
                for (let i = 0; i < parameters.length; ++i) {
                    if (typeof parameters[i] !== signature[i]) {
                        throw new Error(`Expected parameter ${i + 1} of type ${signature[i]}, got ${typeof parameters[i]}`);
                    }
                }
                value = methodDefinition.value.apply(null, parameters);
            } else {
                if (signature.length === 0 || signature[0] !== 'self') {
                    throw new Error(`Can not call static messages through objects.\n Try '${valueTypeDefinition.name}.${method}'(/*...*/) instead.`);
                }
                if (parameters.length + 1 !== signature.length) {
                    throw new Error(`Expected ${signature.length - 1} parameter(s), got ${parameters.length}`);
                }
                for (let i = 0; i < parameters.length; ++i) {
                    if (typeof parameters[i] !== signature[i + 1]) {
                        throw new Error(`Expected parameter ${i + 1} of type ${signature[i + 1]}, got ${typeof parameters[i]}`);
                    }
                }
                value = methodDefinition.value.apply(null, [value].concat(parameters));
            }
        } else {
            const valueType = valueTypeDefinition;
            throw new Error(`Found no such method '${method}()' for type ${valueType}`);
        }
    }
    return value;
}
```

Yes, it is becoming gigantic, but we won't chage it much anymore.

Strings
-------
The last one is strings. The basic string operations are concatenate, slice, compare (equals, lessThan, largerThan) an size.
An there is...

Change piece:

```js
if (this.nextToken.type !== ')') {
    parameters.push(this.parseMessage());
    while (this.nextToken.type === ',') {
        this.next();
        parameters.push(this.parseMessage());
    }
}
```

And add to string builtins:
```js
concat: {
    type: 'function',
    signature: ['self', 'string'],
    returns: 'string',
    value: (s, z) => s + z
},
slice: {
    type: 'function',
    signature: ['self', 'number', 'number'],
    returns: 'string',
    value: (s, o, l) => s.substr(o, l)
},
getLength: {
    type: 'function',
    signature: ['self'],
    returns: 'number',
    value: s => s.length
},
equals: {
    type: 'function',
    signature: ['self', 'string'],
    returns: 'boolean',
    value: (s, z) => s === z,
},
isBefore: {
    type: 'function',
    signature: ['self', 'string'],
    returns: 'boolean',
    value: (s, z) => s < z,
},
isAfter: {
    type: 'function',
    signature: ['self', 'string'],
    returns: 'boolean',
    value: (s, z) => s > z,
}
```