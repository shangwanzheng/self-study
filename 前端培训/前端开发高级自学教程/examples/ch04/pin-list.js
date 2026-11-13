function buildRows(n, stock, amountFen) {
  var list = [];
  var i;
  for (i = 0; i < n; i++) {
    list.push({ stock: stock, amountFen: amountFen });
  }
  return list;
}

function pin(list) {
  return function () {
    return list;
  };
}

var oldList = buildRows(10000, 8, 19950);
var readOld = pin(oldList);
var pageList = buildRows(20, 8, 19950);
var held = readOld();
