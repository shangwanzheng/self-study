const body = JSON.parse(text) as {
  id: string;
  amountFen: number;
};
// 编译器此后按订单使用 body
// 浏览器仍拿到 parse 出来的那个值
