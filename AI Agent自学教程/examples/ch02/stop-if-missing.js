function nextStep(claim) {
  if (typeof claim.overYuan !== 'number') {
    return '停';
  }
  if (typeof claim.limitYuan !== 'number' || typeof claim.claimedYuan !== 'number') {
    return '停';
  }
  return '字段齐';
}

console.log(nextStep({ limitYuan: 200, claimedYuan: 350 }));
console.log(nextStep({ limitYuan: 200, claimedYuan: 350, overYuan: 150 }));
