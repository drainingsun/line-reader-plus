"use strict"

const crypto = require("crypto")
const fs = require("fs")

const LineReaderPlus = require("./../libs/index.js")

const benchmark = require("benchmark")
const beautifyBenchmark = require("beautify-benchmark")
const split2 = require("split2")

const separator = "\n"
const filePath = "benchmark.dat"
const lineSize = 8192
const maxLines = 10000

let lines = []

for (let j = 0; j < maxLines; j++) {
    lines.push(crypto.randomBytes(lineSize).toString("hex"))
}

fs.writeFileSync(filePath, lines.join(separator))

const suite = new benchmark.Suite()

suite.add("With LineReadePlus", {
    defer: true,
    fn: (deferred) => {
        fs.createReadStream(filePath)
            .pipe(new LineReaderPlus())
            .on("data", () => {
            })
            .on("end", () => {
                deferred.resolve()
            })
    }
})

suite.add("With Split2", {
    defer: true,
    fn: (deferred) => {
        fs.createReadStream(filePath)
            .pipe(split2())
            .on("data", () => {
            })
            .on("end", () => {
                deferred.resolve()
            })
    }
})


suite.add("RAW (no pipes)", {
    defer: true,
    fn: (deferred) => {
        const file = fs.createReadStream(filePath)
            .on("data", () => {
            })
            .on("end", () => {
                deferred.resolve()
            })

        file.setEncoding("utf-8")
    }
})

suite
    .on("start", () => {
        console.log(`8192 bytes in HEX x ${maxLines} lines = ~160 MB`) // eslint-disable-line no-console
    })
    .on("cycle", (event) => {
        beautifyBenchmark.add(event.target)
    })
    .on("complete", () => {
        beautifyBenchmark.log()
    })
    .run({async: false})

