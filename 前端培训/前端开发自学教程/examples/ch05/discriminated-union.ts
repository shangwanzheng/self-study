type OrderOk = { code: 0; amountFen: number; list: string[] };
type OrderFail = { code: 40001 };
type OrderResult = OrderOk | OrderFail;

function readFen(body: OrderResult): number | undefined {
  if (body.code === 0) return body.amountFen;
  return undefined;
}
