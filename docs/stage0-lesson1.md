Parsing a Hello World
=====================

The most basic stuff a language must to support is input and output. Starting by the later, the most obvious thing to do  is to create a "hello word". It is just the classic way to do it. So, for now our goal is to parse:

```bootlang
writeln('Hello World');
```

The syntax, on [EBNF+][], is simply:

```ebnf+
program = 'writeln', '(', "'Hello World", ')', ';' ;
```


A simple and effective way to do it is. We need only be able to parse a function call and a string.
Firstly, we need a lexical analysins, and we do it on the following js class:

```js
exports = module.exports = class Tokenizer {
    constructor(text) {
        this.pattern = /\s*([\(\);])|(writeln)|('Hello World')/y;
        this.text = text;
    }

    next() {
        const result = this.pattern.exec(this.text);
        if (result) {
            return result[1] || result[2] || result[3];
        }
        return null;
    }
}
```

The *sticky* tag does an exact match, with no jump. The `\s*` is to allow space between tokens. In the end it returns all the tokens it found, each being returned after next() is called. Our parser looks like the following:

```js
const Tokenizer = require('./Tokenizer')

exports = module.exports = class Parser {
    constructor(text) {
        this.tokenizer = new Tokenizer(text);
    }

    parse() {
        this.match('writeln');
        this.match('(');
        this.match('\'Hello World\'');
        this.match(')');
        this.match(';');
        console.log('Hello World');
    }

    match(expected) {
        const received = this.tokenizer.next();
        if (expected !== received) {
            throw new Error(`Expected ${expected}, got ${received}`);
        }
    }
}
```

Our parser is also our interpreter here. The parser has to generate no code as it alwasys will generate the same effect, we just need to check if the syntax is right. The problem is, we can only print hello world. 

Printing any String
-------------------
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
    constructor(text) {
        this.tokenizer = new Tokenizer(text);
        this.next();
    }

    parse(runtime) {
        while (this.nextToken !== null) {
            this.matchWord('writeln');
            this.match('(');
            runtime.writeln(this.parseString());
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
```

Our interpretor can be like this:
```js
const parser = new Parser(fs.readFileSync(process.argv[2]));

const runtime = {
    writeln(text) {
        process.stdout.write(text + '\n');
    },
}
parser.parse(runtime)
```

Now we can call programs like these:

```bootlang
writeln('Hello World!!!');
```

Or These:
```bootlang
writeln('Hi ''Mundo''!');
```

Or even these:
```bootlang
writeln('Grettings, ');
writeln('globe!');
```
More than one output function
-----------------------------

We still have a last adjustment to do. What if instead of just `writeln`, we also had `write` that does not put a end line after after printing.

First, we need to create this small method on our Parser class. It is very similar to our `parseString()`.
```js
parseId() {
    return this.match('id').value;
}
```

Then we change the content of the while inside our `parse()` method:
```js
const callee = this.parseId();
if (!runtime[callee]) {
    throw new Error(`Function ${callee} not defined`)
}
this.match('(');
const param = this.parseString();
runtime[callee](param);
this.match(')');
this.match(';');
```

Of course this *switch* will not scale well and we will have to replace it later, but for now is good enough. Let's our future selves deal with it. Now we can have code like this:

```
writeln('Hello World');
write('Hi ''Mundo''!');
```

And that is the end of our hello world parsing. As an exercise, would you implement a comment feature? Try to do it! (Or see the [source code], I don't own you). See you [next lesson].

[source code]: https://github.com/talesm/bootlang/tree/lesson0-1
[next lesson]: ./stage0-lesson2
[ebnf+]: https://pt.wikipedia.org/wiki/Formalismo_de_Backus-Naur_Estendido