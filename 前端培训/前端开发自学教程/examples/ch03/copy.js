const list = {
  id: order.snowflakeText,
  amountFen: order.amountFen,
  draft: { stock: order.stock }
};
const detail = { id: list.id, amountFen: list.amountFen, draft: list.draft };
detail.draft.stock = order.stock - 1;
// list.draft.stock 也变成 7。order.stock 仍是 8。

const fresh = {
  id: order.snowflakeText,
  amountFen: order.amountFen,
  draft: { stock: order.stock }
};
const next = {
  id: fresh.id,
  amountFen: fresh.amountFen,
  draft: { stock: order.stock - 1 }
};
// fresh.draft.stock 仍是 8，next.draft.stock 是 7。

const payload = { page: order.page, remark: undefined, amountFen: order.amountFen };
const cloned = JSON.parse(JSON.stringify(payload));
// cloned.page 为 1，cloned.amountFen 为 19950，cloned 上没有 remark
