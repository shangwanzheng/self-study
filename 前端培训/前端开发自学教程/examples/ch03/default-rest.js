function setQty(qty = order.stock) {
  return qty;
}
setQty(0);           // 0
setQty(undefined);   // 8
setQty();            // 8

function describe(id, ...parts) {
  return parts.length;
}
// describe(snowflakeText, amountFen, stock) 的长度是 2
