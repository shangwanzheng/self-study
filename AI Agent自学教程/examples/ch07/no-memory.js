function seesOnlyThisTurn(currentText) {
  return {
    previousLimit: null,
    reads200: currentText.indexOf('上限 200') >= 0
  };
}
