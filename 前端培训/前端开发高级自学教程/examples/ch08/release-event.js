function orderView(release) {
  return { route: '/orders', release: release };
}

var aligned = orderView('app.goodhash.js');
var missing = { route: '/orders' };

console.log(aligned.route);
console.log(aligned.release);
console.log(missing.release);
