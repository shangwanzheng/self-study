function buildRows(n, stock, amountFen) {
  var list = [];
  var i;
  for (i = 0; i < n; i++) {
    list.push({ stock: stock, amountFen: amountFen });
  }
  return list;
}

var list = buildRows(10000, 8, 19950);
var copied = structuredClone(list);
copied[0].stock = 7;
