function handOff(claim) {
  var allowed = ['limitYuan', 'claimedYuan', 'overYuan'];
  var seen = {};
  var key;
  var i;
  for (key in claim) {
    if (Object.prototype.hasOwnProperty.call(claim, key)) seen[key] = true;
  }
  for (i = 0; i < allowed.length; i++) {
    key = allowed[i];
    if (typeof claim[key] !== 'number' || claim[key] !== Math.trunc(claim[key])) {
      return { tool: null, reason: '停' };
    }
  }
  for (key in seen) {
    if (allowed.indexOf(key) < 0) {
      return { tool: null, reason: '停' };
    }
  }
  if (claim.overYuan !== claim.claimedYuan - claim.limitYuan) {
    return { tool: null, reason: '停' };
  }
  return { tool: 'lookupClause', reason: '字段齐' };
}

console.log(handOff({ limitYuan: 200, claimedYuan: 350 }).tool);
console.log(handOff({ limitYuan: 200, claimedYuan: 350, overYuan: 150 }).tool);
console.log(handOff({ limitYuan: 200, claimedYuan: 350, overYuan: 150, bonusYuan: 200 }).tool);
