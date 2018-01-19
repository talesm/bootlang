const { Buffer } = require('buffer');
const Parser = require('./boot0/Parser');
const fs = require('fs');
const os = require('os');

let ok = true;

const runtime = {
    writeln(text) {
        process.stdout.write(text + os.EOL);
    },

    write(text) {
        process.stdout.write(text);
    },

    readln() {
        const buf = Buffer.alloc(1);
        let result = '';
        while (fs.readSync(0, buf, 0, 1, null) !== 0) {
            const ch = buf.toString();
            if (ch === '\n') {
                return result;
            }
            if (ch === '\r') {
                continue;
            }
            result += ch;
        }
        ok = false;
        return result;
    },

    readOk() {
        return ok;
    }
}

const parser = new Parser(fs.readFileSync(process.argv[2], 'utf8'), runtime);
parser.parse();
