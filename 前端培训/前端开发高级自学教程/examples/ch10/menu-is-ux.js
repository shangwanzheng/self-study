function paintOrdersMenu(experienceAllowed) {
  return { visible: !!experienceAllowed };
}

function requestOrders(order) {
  return { path: order.apiPath, authorizeOnServer: true };
}
