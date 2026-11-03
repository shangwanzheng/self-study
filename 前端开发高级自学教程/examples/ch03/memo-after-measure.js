var bundleMainKb = 180;
var bundleVendorKb = 420;

function firstScreenKb() {
  return bundleMainKb + bundleVendorKb;
}

function memo(render) {
  var prev;
  var prevOut;
  return function (row) {
    if (row === prev) return prevOut;
    prev = row;
    prevOut = render(row);
    return prevOut;
  };
}

function renderRow(row) {
  return row.amountText;
}

var MemoRow = memo(renderRow);
console.log(MemoRow({ amountText: '199.50' }));
console.log('没测量也包了 memo，首屏仍是', firstScreenKb());
