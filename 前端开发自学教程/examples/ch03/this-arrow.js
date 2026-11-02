const row = {
  stock: order.stock,
  read() { return this.stock; },
  readArrow: () => this.stock
};
row.read();                         // 8
const read = row.read;
read.call(row);                     // 8
read.call({ stock: order.stock - 1 }); // 7
read.bind(row)();                   // 8
// 严格模式：read() 的 this 是 undefined，读 this.stock 抛 TypeError
// readArrow.call(...) 改不了箭头的 this

class OrderCard {
  constructor(stock) {
    this.stock = stock;
    this.read = () => this.stock;
  }
}
const cardRead = new OrderCard(order.stock).read;
// cardRead() 仍是 8

function readNested() {
  function inner() { return this.stock; }
  return inner();
}
function readLex() {
  const inner = () => this.stock;
  return inner();
}
// readNested.call(row) 抛 TypeError
// readLex.call(row) 是 8
