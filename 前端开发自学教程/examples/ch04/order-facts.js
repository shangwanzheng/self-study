// order-facts.js 不再导入 view 或 api
export const amountFen = 19950;

export function loadOrders(page, size) {
  // 调用时才发请求。模块被 import 时不发。
}
