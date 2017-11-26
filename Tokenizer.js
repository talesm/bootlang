exports = module.exports = class Tokenizer {
    constructor(text) {
        this.pattern = /(?:\s|\/\*(?:[^\*]|\*[^\/])*\*\/)*(?:([\(\);])|(\w+)|\'((?:[^\']|\'\')*)\')/y;
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
        return null;
    }
}
