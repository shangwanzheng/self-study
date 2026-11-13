type OrderOk = {
  readonly id: string;
  amountFen: number;
  route: "/orders";
};
type Coded = { code: 0 | 40001 };
type Row = OrderOk & Coded;
type Draft = { note?: string };
