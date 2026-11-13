function bundleReport(order) {
  var firstKb = order.bundleMainKb + order.bundleVendorKb;
  return {
    mainKb: order.bundleMainKb,
    vendorKb: order.bundleVendorKb,
    routeKb: order.bundleRouteKb,
    firstKb: firstKb,
    routeInFirst: false
  };
}
