function StockField(props) {
  return renderInput({
    value: props.stock,
    onChange: function (next) { props.onStock(next); }
  });
}

function useOrderList(page) {
  var pair = useState(null);
  var list = pair[0];
  var setList = pair[1];
  useEffect(function () {
    var alive = true;
    request("/api/orders", { page: page, size: 20 }).then(function (data) {
      if (alive) setList(data);
    });
    return function () { alive = false; };
  }, [page]);
  return list;
}
