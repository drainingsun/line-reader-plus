"use strict"

const stream = require("stream")
const StringDecoder = require("string_decoder").StringDecoder

class LineReaderPlus extends stream.Transform {
    constructor(separator, encoding, options) {
        options = options || {}

        options.objectMode = true

        super(options)

        this.encoding = encoding || "utf-8"
        this.separator = separator || "\n"

        this._lastChunk = ""
        this._totalCount = 0
        this._totalLength = -1
        this._stringDecoder = new StringDecoder(this.encoding)
    }

    _transform(chunk, encoding, callback) {
        this._lastChunk += this._stringDecoder.write(chunk)

        const list = this._lastChunk.split(this.separator)

        this._lastChunk = list.pop()

        for (let i = 0; i < list.length; i++) {
            this._pushLine(list[i], false)
        }

        callback()
    }

    _flush(callback) {
        this._lastChunk += this._stringDecoder.end()

        if (this._lastChunk) {
            this._pushLine(this._lastChunk, true)
        }

        callback()
    }

    _pushLine(value, last = false) {
        let lineLength = 0

        if (!last) {
            lineLength = Buffer.byteLength(value + this.separator, this.encoding)
        } else {
            lineLength = Buffer.byteLength(value, this.encoding)
        }

        this.push({
            value: value,
            start: this._totalLength + 1,
            end: this._totalLength += lineLength,
            row: ++this._totalCount
        })
    }
}

module.exports = LineReaderPlus