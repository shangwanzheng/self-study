var order = { stock: 8 };

function optimisticStock(order, ok) {
  var shown = order.stock - 1;
  if (!ok) shown = order.stock;
  return shown;
}

console.log(optimisticStock(order, true));   // 7
console.log(optimisticStock(order, false));  // 8，不停在 7
console.log(order.stock);                    // 8
