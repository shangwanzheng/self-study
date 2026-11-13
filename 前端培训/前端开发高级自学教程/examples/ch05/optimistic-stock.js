function settleStock(order, ok) {
  var next = order.stock - 1;
  if (ok) return { ui: next, orderStock: next };
  return { ui: order.stock, orderStock: order.stock };
}
