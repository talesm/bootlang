const Parser = require('./boot0/Parser');
const fs = require('fs');
const readlineSync = require('readline-sync');

const runtime = {
    writeln(text) {
        process.stdout.write(text + '\n');
    },

    write(text) {
        process.stdout.write(text);
    },

    readln() {
        return readlineSync.question('');
    },

    readOk() {
        return true;
    }
}

const parser = new Parser(fs.readFileSync(process.argv[2], 'utf8'), runtime);
parser.parse();
