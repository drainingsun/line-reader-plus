# Line Reader Plus - know where your lines are located.
Processes stream chunks into lines using a separator and adds extra info: start/end byte position and row number. Very 
useful if after reading the lines you want to modify them. 

## Install
```bash
npm install line-reader-plus
```

## Basic Usage
```javascript
const fs = require("fs")
const LineReaderPlus = require("line-reader-plus")  

fs.createReadStream("pathToYourFile")
    .pipe(new LineReaderPlus())
    .on("data", (line) => {
        // line = {value: String, start: Int, end: Int, row: Int)            
    })
```

## Custom Options
```javascript
const fs = require("fs")
const LineReaderPlus = require("line-reader-plus")  

fs.createReadStream("pathToYourFile")
    .pipe(new LineReaderPlus("SeparateMe", "ascii", {highWaterMark: 8}))
    .on("data", (line) => {
        // line = {value: String, start: Int, end: Int, row: Int)           
    })
```

## Notes
Option `objectMode` is always `true`. Meaning you cannot overwrite it. This is required in order to return objects in 
streams `on("data")` event. Otherwise all Transform stream options are acceptable and should work. 

## Benchmarks
I was curious how much does this processing affect stream performance and was pleasantly surprised:
 
```text
8192 bytes in HEX x 10000 lines = ~160 MB
  3 tests completed.

With LineReadePlus x 4.50 ops/sec ±5.67% (26 runs sampled)
With Split2        x 2.50 ops/sec ±6.29% (17 runs sampled)*
RAW (no pipes)     x 7.55 ops/sec ±2.74% (40 runs sampled)
 ```
 
*No extra info, just splitting into lines.
 
What do you know, only ~40% slower than raw and faster than well established 
[split2](https://www.npmjs.com/package/split2). But take the results with a grain of salt. There's plenty of OS level 
caching going on behind the scenes. Which means that speed might be quite off. To check it yourself, 
run: `npm run benchmark`
 
## Testing
```bash
npm test
```

## Linting
```bash
npm run lint
```