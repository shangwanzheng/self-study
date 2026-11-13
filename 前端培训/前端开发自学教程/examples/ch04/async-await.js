async function readAmount() {
  const got = await loadOrder();
  const amountFen = got.amountFen;
  return amountFen;
}
