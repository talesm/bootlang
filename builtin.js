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

exports.readln = {
    type: 'function',
    name: 'readln',
    signature: [],
    returns: 'void',
    definition: function (text) {
        return this.readln();
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
            signature: ['string'],
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
        },
        concat: {
            type: 'function',
            signature: ['string'],
            returns: 'string',
            definition: (s, z) => s + z
        },
        slice: {
            type: 'function',
            signature: ['number', 'number'],
            returns: 'string',
            definition: (s, o, l) => s.substr(o, l)
        },
        getLength: {
            type: 'function',
            signature: [],
            returns: 'number',
            definition: s => s.length
        },
        equals: {
            type: 'function',
            signature: ['string'],
            returns: 'boolean',
            definition: (s, z) => s === z,
        },
        isBefore: {
            type: 'function',
            signature: ['string'],
            returns: 'boolean',
            definition: (s, z) => s < z,
        },
        isAfter: {
            type: 'function',
            signature: ['string'],
            returns: 'boolean',
            definition: (s, z) => s > z,
        },
        toAscii: {
            type: 'function',
            signature: [],
            returns: 'number',
            definition: s => s.codePointAt(0),
        },
        fromAscii: {
            type: 'function',
            name: 'fromAscii',
            static: true,
            signature: ['number'],
            returns: 'string',
            definition: n => String.fromCodePoint(n),
        }
    }
}
