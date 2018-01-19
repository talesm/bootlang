var Parser = require('./boot0/Parser');
var fs = require('fs');
const os = require('os');

const dir = './tests/boot0/'
fs.readdir(dir, (err, files) => {
    if (err) {
        console.error(err);
        return;
    }

    files.forEach(file => /.blang$/.test(file) && fs.readFile(dir + file, 'utf8', (err, source) => {
        let result = '';
        const radical = file.slice(0, file.lastIndexOf('.'));
        const inputFile = dir + radical + '.input';
        let input = null;
        if (files.indexOf(radical + '.input') !== -1) {
            input = fs.readFileSync(inputFile, 'utf8');
        }
        const runtime = {
            writeln(text) {
                result += text + os.EOL;
            },
            write(text) {
                result += text;
            },
            readln() {
                if (!input) {
                    throw new Error('No input file found.');
                }
                const endln = input.indexOf('\n');
                if (endln === -1) {
                    const result = input;
                    input = '';
                    return result;
                } else {
                    const result = input.slice(0, endln);
                    input = input.slice(endln + 1);
                    return result;
                }
            }
        };
        try {
            new Parser(source, runtime).parse();
            const expected = fs.readFileSync(dir + radical + '.expected', 'utf8');
            if (expected === result) {
                console.log(`${file}: ok`);
            } else {
                console.log(`${file} expected:\n~~~~\n${expected}\n~~~~\nGot\n~~~~\n${result}\n~~~~\n`);
            }
        } catch (err) {
            console.error(`${file}: ${err}`);
        }
    }));
});
