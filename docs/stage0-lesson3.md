Binding
=======

We have until now a glorified and [uggly calculator][old source code]. Right now is impossible to do one of the most basic operations: storing and loading values on variables. Let's be modern and use type induction and use something like:

```
let a = 5; /* Constant */
let mutable b = 'Oi'; /* Variable*/
```

First edit our parse method to this:

```js
parse(runtime) {
    this.runtime = runtime;
    while (this.nextToken !== null) {
        this.parseStatement();
        this.match(';');
    }
}
```

Then this new method:
```js
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
    } else if (this.nextToken.type == '(') {
        const functionDefinition = this.ctx[word];
        if (!functionDefinition || functionDefinition.type !== 'function') {
            throw new Error(`Function ${word} not defined`)
        }
        const parameters = this.parseParameters(functionDefinition.signature);
        functionDefinition.definition.apply(this.runtime, parameters);
    } else {
        throw Error('Invalid Statement ' + word);
    }
}
```

Then our getType's case 'object' to this:
```js
case 'object':
    if (value.type === 'type') {
        return value;
    } else if (value.type === 'binding') {
        return value.valueType;
    } else {
        throw Error(`Invalid type ${value.type}`);
    }
```

Then our parseValue's case 'id' to this:
```js
case 'id':
    const name = this.parseId();
    const definition = this.ctx[name];
    if (!definition) {
        throw new Error(`Name ${name} not declared`);
    }
    if (definition.type === 'type') {
        return this.ctx[name];
    }
    if (definition.type === 'binding') {
        return this.ctx[name].value;
    }
```

And now we can execute code like this:

```blang
let a = 5;
writeln(a.toString());
let mutable s = 'Hi';
writeln(s);
s = 'Hello';
writeln(s);
```

A readln function
-----------------

Now is time to add a readln function. We already have a place to store a value so it will be useful. The function itself is very easy to put:

```js
exports.readln = {
    type: 'function',
    name: 'readln',
    signature: [],
    returns: 'void',
    definition: function (text) {
        return this.readln();
    }
}
```

But we can't call functions inside parameters, so we modify our parseValue's "id" case to this:
```js
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
```

We need also to modify our interpreter's runtime to add this function.

```js
const readlineSync = require('readline-sync');
/* ... */
const runtime = {
    /* ... */
    readln() {
        return readlineSync.question('');
    }
}
/* ... */
```
Or something similar to it. The realine-sync is an externa package, so if you choose to use it you need to install it:

```bash
$ npm install readline-sync --save
```

And that's it. See my [source code] to compare with yours. And head to [next lesson].

[old source code]: https://github.com/talesm/bootlang/tree/lesson0-2
[source code]: https://github.com/talesm/bootlang/tree/lesson0-3
[next lesson]: ./stage0-lesson4
[previous lesson]: ./stage0-lesson2
