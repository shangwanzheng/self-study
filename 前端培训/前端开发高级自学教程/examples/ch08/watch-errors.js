var release = 'app.goodhash.js';
var seen = [];

function noteScriptError(message, file) {
  seen.push({ kind: '脚本错误', message: message, file: file, release: release });
}

function noteUnhandledRejection(reason) {
  seen.push({ kind: '未处理拒绝', reason: reason, release: release });
}

noteScriptError('yuanText is not a function', release);
noteUnhandledRejection('orders rejected');

console.log(seen[0].kind);
console.log(seen[0].file);
console.log(seen[0].release);
console.log(seen[1].kind);
console.log(seen[1].release);
console.log(seen.length);
