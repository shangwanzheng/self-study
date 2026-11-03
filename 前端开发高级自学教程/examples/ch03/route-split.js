var bundleMainKb = 180;
var bundleVendorKb = 420;
var bundleRouteKb = 40;

function firstScreenKb(routeInFirstScreen) {
  var kb = bundleMainKb + bundleVendorKb;
  if (routeInFirstScreen) {
    kb = kb + bundleRouteKb;
  }
  return kb;
}

console.log('不进', firstScreenKb(false));
console.log('进首屏', firstScreenKb(true));
