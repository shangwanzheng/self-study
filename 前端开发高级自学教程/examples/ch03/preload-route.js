var bundleMainKb = 180;
var bundleVendorKb = 420;
var bundleRouteKb = 40;

function firstScreenKb(preloadRoute) {
  var kb = bundleMainKb + bundleVendorKb;
  if (preloadRoute) {
    kb = kb + bundleRouteKb;
  }
  return kb;
}

console.log('不预加载', firstScreenKb(false));
console.log('预加载路由块', firstScreenKb(true));
