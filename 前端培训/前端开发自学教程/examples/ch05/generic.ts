function readFen<T extends { amountFen: number }>(row: T): number {
  return row.amountFen;
}
// readFen(教学订单) → 19950
