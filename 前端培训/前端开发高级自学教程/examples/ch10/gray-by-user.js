function hitGray(order, buildLabel, rule) {
  if (rule.kind === 'user') return order.userIdText === rule.userIdText;
  if (rule.kind === 'version') return buildLabel === rule.buildLabel;
  return false;
}
