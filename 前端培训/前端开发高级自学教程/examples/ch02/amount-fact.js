var amountFen = 19950;

function yuanText(fen) {
  var sign = fen < 0 ? '-' : '';
  var v = Math.abs(Math.trunc(fen));
  var whole = Math.floor(v / 100);
  var frac = String(v % 100);
  if (frac.length < 2) {
    frac = '0' + frac;
  }
  return sign + whole + '.' + frac;
}

function amountFactCopies(mode) {
  if (mode === 'each-app') {
    return 2;
  }
  return 1;
}

console.log('只在 BFF', amountFactCopies('bff'), amountFen, yuanText(amountFen));
console.log('各写一份', amountFactCopies('each-app'), amountFen, yuanText(amountFen));
