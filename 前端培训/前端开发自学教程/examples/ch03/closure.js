function remember(page) {
  return function load() { return page; };
}
const row = { page: order.page };
const load = remember(row.page);
row.page = 2;
// load() 仍是 1。参数绑定和 row.page 不是同一份。

let page = order.page;
const live = function () { return page; };
page = 2;
// live() 是 2。赋值改的就是它闭上的那个绑定。

const current = function () { return row.page; };
// row.page 已经是 2，current() 是 2。字段在调用时读取。

function pair(page) {
  return {
    read: function () { return page; },
    next: function () { page = page + 1; return page; }
  };
}
const box = pair(order.page);
box.next();
// next 把这份绑定从 1 改成 2，read() 也是 2。

function byVar() {
  var page;
  var fns = [];
  for (page = 1; page <= 2; page++) fns.push(function () { return page; });
  return [fns[0](), fns[1]()];
}
// [3, 3]

function byLet() {
  var fns = [];
  for (let page = 1; page <= 2; page++) fns.push(function () { return page; });
  return [fns[0](), fns[1]()];
}
// [1, 2]
