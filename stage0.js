const Parser = require('./boot0/Parser');
const fs = require('fs');

const parser = new Parser(fs.readFileSync(process.argv[2]));
parser.parse();
