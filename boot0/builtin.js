exports.write = {
    type: 'function',
    name: 'write',
    signature: ['string'],
    returns: 'void',
    definition: function (text) {
        this.write(text);
    }
}

exports.writeln = {
    type: 'function',
    name: 'writeln',
    signature: ['string'],
    returns: 'void',
    definition: function (text) {
        this.writeln(text);
    }
}

exports.number = {
    type: 'type',
    name: 'number',
    methods: {
        toString: {
            type: 'function',
            name: 'toString',
            signature: [],
            returns: 'string',
            definition: n => n.toString()
        }
    }
}

exports.boolean = {
    type: 'type',
    name: 'boolean',
    methods: {
        toString: {
            type: 'function',
            name: 'toString',
            signature: [],
            returns: 'string',
            definition: n => n.toString()
        }
    }
}

exports.string = {
    type: 'type',
    name: 'string',
    methods: {
        toString: {
            type: 'function',
            name: 'toString',
            signature: [],
            returns: 'string',
            definition: n => n
        }
    }
}
