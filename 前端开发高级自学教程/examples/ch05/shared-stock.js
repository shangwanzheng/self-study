function createStock(order) {
  var stock = order.stock;
  return {
    get: function () { return stock; },
    set: function (next) { stock = next; }
  };
}

function readList(stock) {
  return stock.get();
}

function readDetail(stock) {
  return stock.get();
}
