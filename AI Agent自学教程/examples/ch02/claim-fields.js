var limitYuan = 200;
var claimedYuan = 350;
var overYuan = 150;

function claimFields() {
  return {
    limitYuan: limitYuan,
    claimedYuan: claimedYuan,
    overYuan: overYuan
  };
}

function hasThreeIntegers(claim) {
  var limitOk = typeof claim.limitYuan === 'number' && claim.limitYuan === Math.trunc(claim.limitYuan);
  var claimedOk = typeof claim.claimedYuan === 'number' && claim.claimedYuan === Math.trunc(claim.claimedYuan);
  var overOk = typeof claim.overYuan === 'number' && claim.overYuan === Math.trunc(claim.overYuan);
  return limitOk && claimedOk && overOk;
}

var claim = claimFields();
console.log(hasThreeIntegers(claim), claim.limitYuan, claim.claimedYuan, claim.overYuan);
