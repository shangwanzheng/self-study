Promise.all([loadList(page, size), loadStock(), loadAmount()])
  .then(function (parts) {
    // 三条都兑现才到这里；金额分在兑现值里
  })
  .catch(function () {
    // 任意一条拒绝都到这里，要给出失败说明
  });
