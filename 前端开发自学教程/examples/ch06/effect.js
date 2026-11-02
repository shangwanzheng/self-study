useEffect(function () {
  var alive = true;
  request(page, size).then(function (data) {
    if (alive) setList(data);
  });
  return function () { alive = false; };
}, [page, size]);
