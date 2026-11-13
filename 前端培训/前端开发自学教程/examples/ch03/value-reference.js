const order = Course.data.order;
let shown = order.stock;
shown = shown - 1;
// shown 为 7，order.stock 仍为 8

const alias = order;
// alias === order 为 true，两边是同一张订单
