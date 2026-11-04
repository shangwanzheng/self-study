function sceneSummary(lines) {
  var hasLimit = false;
  var hasOver = false;
  var i;
  for (i = 0; i < lines.length; i++) {
    if (lines[i].indexOf('上限 200') >= 0) hasLimit = true;
    if (lines[i].indexOf('超出 150') >= 0) hasOver = true;
  }
  return {
    importance: '高',
    cause: hasLimit && hasOver ? '上限 200 元，这单 350 元，超出 150 元' : '',
    next: '等人确认'
  };
}

function summaryComplete(summary) {
  return summary.importance.length > 0
    && summary.cause.indexOf('上限 200') >= 0
    && summary.cause.indexOf('超出 150') >= 0
    && summary.next === '等人确认';
}
