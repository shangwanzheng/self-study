var bundleMainKb = 180;
var bundleVendorKb = 420;

function firstScreenWithVendor(extraCopy) {
  var kb = bundleMainKb + bundleVendorKb;
  if (extraCopy) {
    kb = kb + bundleVendorKb;
  }
  return kb;
}

console.log('一份公共依赖', firstScreenWithVendor(false));
console.log('再叠一份', firstScreenWithVendor(true));
