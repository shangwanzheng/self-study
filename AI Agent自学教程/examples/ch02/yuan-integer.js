function yuanIsInteger(value) {
  return typeof value === 'number' && value === Math.trunc(value);
}

console.log('整数 200', yuanIsInteger(200));
console.log('字符串 200', yuanIsInteger('200'));
console.log('汉字两百', yuanIsInteger('两百'));
