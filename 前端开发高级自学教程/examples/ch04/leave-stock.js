function mount(order) {
  var button = document.getElementById('order-refresh');
  var timer = setTimeout(function () {
    order.stock = 7;
  }, 0);
  function onClick() {
    order.stock = 7;
  }
  button.addEventListener('click', onClick);
  return function cleanup() {
    clearTimeout(timer);
    button.removeEventListener('click', onClick);
  };
}
