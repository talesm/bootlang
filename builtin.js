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
        },
        add: {
            type: 'function',
            signature: ['number'],
            returns: 'number',
            definition: (a, b) => a + b,
        },
        sub: {
            type: 'function',
            signature: ['number'],
            returns: 'number',
            definition: (a, b) => a - b,
        },
        equals: {
            type: 'function',
            signature: ['number'],
            returns: 'boolean',
            definition: (a, b) => a === b
        },
        isAfter: {
            type: 'function',
            signature: ['number'],
            returns: 'boolean',
            definition: (a, b) => a > b
        },
        isBefore: {
            type: 'function',
            signature: ['number'],
            returns: 'boolean',
            definition: (a, b) => a < b
        },
        parseOrPanic: {
            type: 'function',
            name: 'parseOrPanic',
            static: true,
            signature: ['number'],
            returns: 'boolean',
            definition: (s) => +s
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
        },
        not: {
            type: 'function',
            signature: [],
            returns: 'boolean',
            definition: n => !n
        },
        and: {
            type: 'function',
            signature: ['boolean'],
            returns: 'boolean',
            definition: (a, b) => a && b
        },
        or: {
            type: 'function',
            signature: ['boolean'],
            returns: 'boolean',
            definition: (a, b) => a || b
        },
        equals: {
            type: 'function',
            signature: ['boolean'],
            returns: 'boolean',
            definition: (a, b) => a === b
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
