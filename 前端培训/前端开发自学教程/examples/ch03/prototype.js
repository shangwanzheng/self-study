function OrderLine(stock) {
  this.stock = stock;
}
OrderLine.prototype.text = function () { return this.stock; };
const a = new OrderLine(order.stock);
const b = new OrderLine(order.stock - 1);
// a.text() 为 8，b.text() 为 7，a.text === b.text

class OrderCard {
  constructor(stock) { this.stock = stock; }
  text() { return this.stock; }
}
