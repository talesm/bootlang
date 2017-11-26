exports = module.exports = class Tokenizer {
    constructor(text) {
        this.pattern = /(?:\s|\/\*(?:[^\*]|\*[^\/])*\*\/)*(?:([\(\);\.=:,{}\[\]])|(true|false)|(\d+)|(\w+)|\'((?:[^\']|\'\')*)\')/y;
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
            return { type: 'boolean', value: result[2] === 'true' };
        }
        if (result[3]) {
            return { type: 'number', value: +result[3] }
        }
        if (result[4]) {
            return { type: 'id', value: result[4] };
        }
        if (result[5]) {
            return { type: 'string', value: result[5].replace(/''/g, "'") };
        }
        return null;
    }
}
