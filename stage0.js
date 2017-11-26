const Parser = require('./boot0/Parser');
const fs = require('fs');

const runtime = {
    writeln(text) {
        process.stdout.write(text + '\n');
    },

    write(text) {
        process.stdout.write(text);
    }
}

const parser = new Parser(fs.readFileSync(process.argv[2]), runtime);
parser.parse();
