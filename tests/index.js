"use strict"

const crypto = require("crypto")
const fs = require("fs")

const LineReaderPlus = require("../libs/index.js")

const should = require("should") // eslint-disable-line no-unused-vars

const filePath = "test.dat"
const lineSize = 1024
const maxLines = 100

const defaults = () => {
    const separator = "\n"
    const encoding = "utf-8"

    let lastLineWritten = ""

    const defaultsSetup = (done) => {
        let lines = []

        for (let i = 0; i < maxLines; i++) {
            lastLineWritten = crypto.randomBytes(lineSize).toString("hex")

            lines.push(lastLineWritten)
        }

        fs.writeFile(filePath, lines.join(separator), (err) => done(err))
    }

    before(defaultsSetup)

    const defaultsTest = (done) => {
        let totalCount = 0
        let x = maxLines

        fs.createReadStream(filePath)
            .pipe(new LineReaderPlus())
            .on("data", (line) => {
                line.should.have.property("value")
                line.should.have.property("start")
                line.should.have.property("end")
                line.should.have.property("row")

                line.row.should.be.equal(++totalCount)

                const options = {
                    start: line.start,
                    end: line.end
                }

                let result = ""

                const file = fs.createReadStream(filePath, options)
                    .on("data", (lineRead) => {
                        result += lineRead
                    })
                    .on("end", () => {
                        result.should.be.startWith(line.value)

                        if (--x === 0) {
                            done()
                        }
                    })

                file.setEncoding(encoding)
            })
    }

    it("Should process lines with default settings", defaultsTest)
}

describe("Defaults (separator: \\n, encoding: utf-8)", defaults)

const custom = () => {
    const separator = "SeparateMe"
    const encoding = "ascii"

    let lastLineWritten = ""

    const customSetup = (done) => {
        let lines = []

        for (let i = 0; i < maxLines; i++) {
            lastLineWritten = crypto.randomBytes(lineSize).toString("hex")

            lines.push(lastLineWritten)
        }

        fs.writeFile(filePath, lines.join(separator), (err) => done(err))
    }

    before(customSetup)

    const customTest = (done) => {
        let totalCount = 0
        let x = maxLines

        fs.createReadStream(filePath)
            .pipe(new LineReaderPlus(separator, encoding, {highWaterMark: 8}))

            .on("data", (line) => {
                line.should.have.property("value")
                line.should.have.property("start")
                line.should.have.property("end")
                line.should.have.property("row")

                line.row.should.be.equal(++totalCount)

                const options = {
                    start: line.start,
                    end: line.end
                }

                let result = ""

                const file = fs.createReadStream(filePath, options)
                    .on("data", (lineRead) => {
                        result += lineRead
                    })
                    .on("end", () => {
                        result.should.be.startWith(line.value)

                        if (--x === 0) {
                            done()
                        }
                    })

                file.setEncoding(encoding)
            })
    }

    it("Should process lines with custom settings", customTest)
}

describe("Custom (separator: SeparateMe, encoding: ascii)", custom)