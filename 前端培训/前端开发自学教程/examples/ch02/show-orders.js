function showOrders() {
  console.log('1 formatAmount');          // 调用栈，马上执行
  setTimeout(function () {
    console.log('3 onLater');              // 先登记，却最后执行
  }, 0);
  Promise.resolve().then(function () {
    console.log('2 onRows');               // 后登记，却排在定时器前
  });
}
showOrders();
