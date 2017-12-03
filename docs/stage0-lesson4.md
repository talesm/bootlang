Control flow
============

No language is complete without some sort of control flow. Here we define the most basic ones

If Statement
============

The if statement is simple: we have a expression and a block. We then execute the block if the expression is true. I think the syntax should be as follows:

```ebnf
if statement = 'if', expression, block, { 'else', 'if', expression, block }, [ 'else', block ] ;
```

The first thing to do is change our parseStatement method to add this:
```js
else if (word === 'if') {
    const condition = this.parseMessage();
    const block = this.parseBlock();
    const conditionType = this.getType(condition).name;
    if (conditionType !== 'boolean') {
        throw Error(`If condition should be a boolean, got ${conditionType}`);
    }
    if (!!condition) {
        block.parse(this.runtime);
    }
    return 'conditional';
}
```

You can see that it is very simple, and we use the parseMessage we already have. But there is this parseBlock()... Now it got a little complicated. We need to read it without interpreting it. If we had some intermediary representation this would be easier, but as we don't we will use the trick bellow:

```js
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
    let pos = 0;
    const fakeTokenizer = {
        next() {
            return tokensQueue[pos++];
        }
    }
    return new Parser(fakeTokenizer, this.ctx);
}
```

And then change our constructor as follows:
```js
constructor(tokens, ctx) {
    this.tokenizer = typeof tokens == 'object' ? tokens : new Tokenizer(tokens);
    this.next();
    this.ctx = Object.create(ctx || builtin);
}
```

And just to avoid the need to put ';' after the '}', change also:
```js
parse(runtime) {
    this.runtime = runtime;
    while (this.nextToken !== null) {
        if (this.parseStatement() !== 'conditional') {
            this.match(';');
        }
    }
}
```

Now we can execute something like this
```blang
let a = 1;
if a.equals(1) {
    writeln('Ok');
}
if a.equals(2) {
    writeln('Not Ok');
}
```

else
----
To have a working else we need to simply check for it just after our condition, like this:

```js
const condition = this.parseMessage();
const block = this.parseBlock();
let elseBlock = null;
if (this.nextToken.type === 'id' && this.nextToken.value === 'else') {
    this.matchWord('else');
    elseBlock = this.parseBlock();
}
const conditionType = this.getType(condition).name;
if (conditionType !== 'boolean') {
    throw Error(`If condition should be a boolean, got ${conditionType}`);
}
if (!!condition) {
    block.parse(this.runtime);
} else if (elseBlock !== null) {
    elseBlock.parse(this.runtime);
}
return 'conditional';
```

else if
-------
To be more intuitive we also want to put something like this:

```blang
if a.equals(2) {
    ...
} else if a.equals(3) {
    ...
}
```
To enable it we first must create the new method:

```js
parseCondition() {
    const tokensQueue = [];
    while (this.nextToken.type !== '{') {
        tokensQueue.push(this.next());
    }
    tokensQueue.push({ type: ';' });
    let pos = 0;
    const fakeTokenizer = {
        next() {
            return tokensQueue[pos++];
        }
    }
    return new Parser(fakeTokenizer, this.ctx);
}
```

then, we alter our if again to be like this:

```js
let condition = this.parseMessage();
const block = this.parseBlock();
const conditionType = this.getType(condition).name;
if (conditionType !== 'boolean') {
    throw Error(`If condition should be a boolean, got ${conditionType}`);
}
if (!!condition) {
    block.parse(this.runtime);
}
while (this.nextToken.type === 'id' && this.nextToken.value === 'else') {
    this.matchWord('else');
    if (this.nextToken.type === 'id' && this.nextToken.value === 'if') {
        this.matchWord('if');
        const elifCondition = this.parseCondition();
        const block = this.parseBlock();
        const conditionType = this.getType(condition).name;
        if (conditionType !== 'boolean') {
            throw Error(`If condition should be a boolean, got ${conditionType}`);
        }
        if (!condition && elifCondition.parseMessage()) {
            block.parse(this.runtime);
            condition = true;
        }
    } else {
        const elseBlock = this.parseBlock();
        if (!condition) {
            elseBlock.parse(this.runtime);
        }
        break;
    }
}
return 'conditional';
```

While statement
===============

While is somewhat more complicated, but with the stuff we built is a lot more simple, just add this clause below the 'if' we just put there on the parseStatement method:

```js
parseStatement(){
    if(...) {
    ...
    } else if (word === 'while') {
        const condition = this.parseCondition();
        const block = this.parseBlock();
        while (!!condition()) {
            block();
        }
        return 'conditional';
    } ...
}
```

And now stuff like this works:

```blang
let mutable i = 0;
while i.isBefore(5) {
    i = i.add(1);
    writeln(i.toString());
}
```

Extra Functions
===============

Now that we have store, read, branch and loop we pretty much have a turing complete language and are ready to start our stage1, the first stage to be written on bootlang itself. However, to make our job easier, we need to create the two following functions:

readOk()
---------
That one is simple. If the last input read was ok, it returns true, otherwise it returns false. A read rarely fails from the keyboard, but most operating systems allow redirecting the input to be from a file. When the file ends, the input fails. This method allows us to be able to detect it. First we add support to it to our runtime:
```js
readOk() {
    return /*...*/;
}
```

Then we add this new function on our builtin:
```js
exports.readOk = {
    type: 'function',
    name: 'readOk',
    signature: [],
    returns: 'boolean',
    definition: function () {
        return this.readOk();
    }
}
```

panic(str)
----------
That one is even simpler, when our code execute it, just halt imediately and print an error string:

```js
exports.panic = {
    type: 'function',
    name: 'panic',
    signature: ['string'],
    returns: 'void',
    definition: function (err) {
        throw Error(`Panic: ${err}`);
    }
}
```

And that's it, we have our stage0! See the [source code] or go to [next lesson].

[old source code]: https://github.com/talesm/bootlang/tree/lesson0-3
[source code]: https://github.com/talesm/bootlang/tree/lesson0-4
[next lesson]: ./stage1-lesson1
[previous lesson]: ./stage0-lesson3
