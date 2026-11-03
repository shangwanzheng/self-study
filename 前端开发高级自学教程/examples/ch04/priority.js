var order = { stock: 8, amountFen: 19950 };
var pendingList = null;

function renderOrders(list) {
  startTransition(function () {
    pendingList = list;
  });
  return { stock: order.stock, amountFen: order.amountFen };
}

function OrderList(suspended) {
  if (suspended) return { view: 'fallback' };
  return { view: 'table', stock: order.stock, amountFen: order.amountFen };
}

function OrderPage() {
  return {
    failureNote: '失败说明留在错误边界外面',
    boundary: OrderList(false)
  };
}
