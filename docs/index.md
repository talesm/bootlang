Bootlang
========
Our goal is to create a self bootstraped programming language. The language should use fairly modern features, but remain as simple as possible. 

Our feature wishlist:

- First class functions;
- sum and prod types;
- type access control;
- constant binding by default and imutable if possible;
- pattern matching;
- Interface based polymorphism;
- Generic types;
- Extension methods;
- a simple Directional Acyclic graph based module system.

Methodology
===========
The translator is built in stages. The stage0 recognize just enough syntax to be considered Turing complete. It has support to only ints, string and Boolean, and types composed over them. The stageL supports the complete language. 


Road to Stage0
==============

These steps decribe an initial nodejs based interpreter with just enough functionality to be able to compile itself. So we can delay support for interfaces, generics and so on and focus on the most basic features:

- String support (at least with compare, concat and slice methods);
- Integer support, with at least add and multiply methods, for obvious reasons;
- Boolean support, to avoid horrible hacks like `1=true` and `0=false`;
- Reading and writing input/output;
- Converting between the types.

On this guide we will post some intermediary code, the complete source is to be found on src/boot0. The tests/boot0/*.blang

[Lesson1](./stage0-lesson1)
---------------------------
This lesson is dedicated to prepare all machinery to do a simple hello world. The basic the setup is covered here too.

[Lesson2](./stage0-lesson2)
---------------------------
This lesson is dedicated the configuration of our builtin types.

[Lesson3](./stage0-lesson3)
---------------------------
This lesson is about variables

[Lesson4](./stage0-lesson4)
---------------------------
This is for control flow.

The Grammar
-----------

Now we have a interpreter for the following grammar([ebnf]):

```ebnf
program         = { statement } ;
statement       = let statement 
                | if statement
                | while statement
                | assignment
                | standalone call ;
let statement   = 'let', ['mutable'], id, '=', expression, ';' ;
if statement    = 'if', expression, block, { 'else', 'if', expression, block }, [ 'else', block ] ;
while statement = 'while', expression, block ;
assignment      = id, '=', expression, ';' ;
standalone call = function call, ';' ;

block           = '{', { statement }, '}';
expression      = method call | function call | value ;
method call     = expression, '.', id, parameters ;
function call   = expression, parameters ;
parameters      = '(', [ expression, {',', expression} ], ')' ;
value           = id | string constant | number constant | 'true' | 'false' | parenthesis ;
parenthesis     = '(', expression, ')' ;
```

Where id is `/(\w-\d)\w*`, string constant is `'([^']|'')*'` and number constant is `\d+`.

Stage1
======

After that we have a basic capable interpretor for a turing complete language. So we going to start building a compiler using the language itself. This compiler, called stage1 is very basic and only exists to kickoff the later versions. It first need to able compile the same grammar our stage0 and then add support to new constructs. 

We do not have functions yet nor any other way to create *subprograms* so have some modularisation we will separate in various programs, one for each compilation step, each producing an intermediary result that will be consumed by the next step. The first consume the source code and the last produces the target code (at least javascript, but we can create other target programs). 

[Lesson1](stage1-lesson1)
-------------------------
In this we create our new tokenizer

[Lesson2](stage1-lesson2)
-------------------------
We create our parser here.

[Lesson3](stage1-lesson3)
-------------------------
We analyse our semantics here.

[Lesson4](stage1-lesson4)
-------------------------
Here we translate our AST to a target language, javascript 
