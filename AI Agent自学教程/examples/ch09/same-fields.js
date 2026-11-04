var limitYuan = 200;
var claimedYuan = 350;
var overYuan = claimedYuan - limitYuan;

function readFields(vendor) {
  return {
    vendor: vendor,
    envelope: '见' + vendor + '文档原文',
    limitYuan: limitYuan,
    claimedYuan: claimedYuan,
    overYuan: overYuan
  };
}

var jia = readFields('甲家');
var yi = readFields('乙家');

console.log(jia.limitYuan, jia.claimedYuan, jia.overYuan);
console.log(yi.limitYuan, yi.claimedYuan, yi.overYuan);
console.log(jia.envelope === yi.envelope);
