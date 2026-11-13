function onClick(page, setPage) {
  setPage(page + 1);
  setPage(page + 1);
}

function onClickQueued(setPage) {
  setPage(function (p) { return p + 1; });
  setPage(function (p) { return p + 1; });
}
