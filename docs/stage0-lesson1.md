Parsing a Hello World
=====================

The most basic stuff a language must to support is input and output. Starting by the later, the most obvious thing to do  is to create a hello word. For now our syntax to this is:

```bootlang
write('Hello World');
```

A simple and effective way to do it. We need only be able to parse a function call and a string.
Firstly, we need a lexical analysins, and we do it on the following js class:

```js
class Tokenizer {
    constructor(text) {
        this.pattern = /\s*([\(\);]|\w+|\'(?:[^\']|\'\')*\')/y;
        this.text = text;
    }

    next() {
        const result = this.pattern.exec(this.text);
        if (result) {
            return result[1];
        }
        return null;
    }
}
```

The *sticky* tag does an exact match, with no jump. The `\s*` is to allow space between tokens. In the end it returns all the tokens it found, each being returned after next() is called. Our parse looks like the following

```js
class Parser {
    constructor(tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    parse() {
        this.match('write');
        this.match('(');
        this.match('\'Hello World\'');
        this.match(')');
        this.match(';');
        process.out.print('Hello World');
    }

    match(expected) {
        const received = this.tokenProvider();
        if (expected !== received) {
            throw new Error(`Expected ${expected}, got ${received}`);
        }
    }
}
```
The parser has to generate no code as it alwasys will generate the same effect, we just need to check if the syntax is right. The problem is, we can only print hello world. 

Printing any hello world
------------------------

We should be able to print something more. We want to print any string. To do
that we must be able to identify what is a string and what is its contents. First we must adjust our lexer:

```js
exports = module.exports = class Tokenizer {
    constructor(text) {
        this.pattern = /\s*(?:([\(\);])|(\w+)|\'((?:[^\']|\'\')*)\')/y;
        this.text = text;
    }

    next() {
        const result = this.pattern.exec(this.text);
        if (!result) {
            return null;
        }
        if (result[1]) {
            return { type: result[1] };
        }
        if (result[2]) {
            return { type: 'id', value: result[2] };
        }
        if (result[3]) {
            return { type: 'string', value: result[3].replace(/''/g, "'") };
        }
    }
}
```

And them we adjust our parser too:

```js
exports = module.exports = class Parser {
    constructor(tokenProvider) {
        this.tokenProvider = tokenProvider;
        this.nextToken = tokenProvider();
    }

    parse() {
        let result = '';

        while (this.nextToken !== null) {
            this.matchWord('write');
            this.match('(');
            result += this.parseString();
            this.match(')');
            this.match(';');
        }
        return result;
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
        this.nextToken = this.tokenProvider();
        return token;
    }
}
```

Now we can call programs like these:

```bootlang
write('Hello World!!!');
```

Or These:
```bootlang
write('Hi ''Mundo''!');
```

Or even these:
```bootlang
write('Grettings, ');
write('globe!');
```
More than one output function
-----------------------------

We still have a last adjustment to do. What if instead of just `write`, we also had `writeln` to put a new line after printing. It is a good and even necessary, as our string type do not hava any escape code for new line. 

First, we need to create this small method on our Parser class. It is very similar to our `parseString()`.
```js
parseId() {
    return this.match('id').value;
}
```

Then we change the content of the while inside our `parse()` method:
```js
const callee = this.parseId();
this.match('(');
const param = this.parseString();
this.match(')');
this.match(';');
switch (callee) {
    case 'write':
        result += param;
        break;

    case 'writeln':
        result += param + '\n';
        break;
    default:
        throw new Error(`Invalid call: ${callee} not declared`)
}
```

Of course this *switch* will not scale well and we will have to replace it later, but for now is good enough. Let's our future selves deal with it. Now we can have code like this:

```
writeln('Hello World');
write('Hi ''Mundo''!');
```

And that is the end of our hello world parsing. As an exercise, would you implement a comment feature? Try to do it! (Or see the source code, I don't own you). See you next lesson.