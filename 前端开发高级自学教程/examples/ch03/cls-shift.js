var rowHeightPx = 48;
var clsShiftPx = 48;

function shiftPx(hasRowHeight) {
  if (hasRowHeight) return 0;
  return clsShiftPx;
}

console.log('行高已预留', shiftPx(true), 'px');
console.log('缺行高，挪动', shiftPx(false), 'px，等于行高', rowHeightPx);
