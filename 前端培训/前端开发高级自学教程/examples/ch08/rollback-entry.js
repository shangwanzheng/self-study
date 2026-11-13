var good = 'app.goodhash.js';
var bad = 'app.badhash.js';

function rollbackByEntry() {
  return { entryPointsTo: good, hashFileName: good };
}

function rollbackByRename() {
  return { entryPointsTo: bad, hashFileName: 'app.rolled.js' };
}

console.log(rollbackByEntry().entryPointsTo);
console.log(rollbackByEntry().hashFileName);
console.log(rollbackByRename().entryPointsTo);
console.log(rollbackByRename().hashFileName);
