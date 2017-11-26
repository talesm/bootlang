const Tokenizer = require('./boot0/Tokenizer');

const expression = process.argv.slice(2).join(' ');
const tokenizer = new Tokenizer(expression);

let token;
console.log(expression);
while ((token = tokenizer.next())) {
    console.log(token);
}