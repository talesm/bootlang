Binding
=======

We have until now a glorified and uggly calculator. Right now is impossible to do one of the most basic operations: storing and loading values on variables. Let's be modern and use type induction and use something like:

```
let a = 5; /* Constant */
let mutable b = 'Oi'; /* Variable*/
```

Good? Good! First, we need to add '=' as a recognized symbol. You should be able to do that now. Then we need to edit our parse method's loop to this:

```js

while (this.nextToken !== null) {
    const word = this.parseId();
    if (this.nextToken.type === '(') {
        const callee = word;
        this.match('(');
        const param = this.parseMessage();
        this.match(')');
        this.match(';');
        const calleeDefinition = this.ctx[callee];
        if (calleeDefinition && calleeDefinition.type === 'function') {
            if (calleeDefinition.signature.length !== 1) {
                throw new Error('Function call with number of parameters != 1 are not implemented yet.');
            }
            const paramType = typeof param;
            if (paramType !== calleeDefinition.signature[0]) {
                throw new Error(`Expected parameter 0 of type ${calleeDefinition.signature[0]}, got ${paramType} on function ${callee}`);
            }
            calleeDefinition.value.call(runtime, param);
        } else {
            throw new Error(`Function ${callee} not defined`);
        }
    } else if (word === 'let') {
        const nextWord = this.parseId();
        const mutable = nextWord === 'mutable';
        const bindingName = mutable ? this.parseId() : nextWord;
        this.match('=');
        const value = this.parseMessage();
        this.match(';');
        if (this.ctx[bindingName]) {
            throw new Error('can not redeclare binding ' + bindingName)
        }
        this.ctx[bindingName] = {
            type: 'binding',
            valueType: this.getType(value)[0],
            value,
            mutable,
        }
    } else if (this.ctx[word]) {
        this.match('=');
        const value = this.parseMessage();
        this.match(';');
        const binding = this.ctx[word];
        if (binding.type !== 'binding' || !binding.mutable) {
            throw new Error(`Symbol ${word} is not a mutable binding`);
        }
        binding.value = value;
    } else {
        throw new Error(`Unexpected symbol: ${word}. Did you forget to declare it?`);
    }
}
```

Then our parseValue's case 'id' to this:
```js
case 'id':
    const name = this.parseId();
    const contextValue = this.ctx[name];
    if (!contextValue) {
        throw new Error(`Name ${name} not declared`);
    }
    return contextValue.type === 'type' ? contextValue : contextValue.value;
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

Now is time to add a readln function. We already have a place to store a value so it will be useful. The function itself is very easy to put, but we need to reestructure our parse class to add the necessary flexibility.

That is the code:
....