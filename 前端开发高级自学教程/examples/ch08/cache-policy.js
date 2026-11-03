var order = { htmlMaxAgeSec: 60, assetMaxAgeSec: 31536000 };

function entryMaxAge(policy) {
  if (policy === 'short') return order.htmlMaxAgeSec;
  return order.assetMaxAgeSec;
}

function afterRollback(policy) {
  if (entryMaxAge(policy) === order.htmlMaxAgeSec) return '新入口';
  return '旧脚本';
}

console.log(entryMaxAge('short'));
console.log(entryMaxAge('long'));
console.log(afterRollback('short'));
console.log(afterRollback('long'));
