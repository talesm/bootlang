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
