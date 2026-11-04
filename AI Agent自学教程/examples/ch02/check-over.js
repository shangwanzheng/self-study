var limitYuan = 200;
var claimedYuan = 350;
var overYuan = 150;

function overMatches(claim) {
  return claim.overYuan === claim.claimedYuan - claim.limitYuan;
}

console.log(overMatches({
  limitYuan: limitYuan,
  claimedYuan: claimedYuan,
  overYuan: overYuan
}));
console.log(overMatches({
  limitYuan: 350,
  claimedYuan: 200,
  overYuan: 150
}));
