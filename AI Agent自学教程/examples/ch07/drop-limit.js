function dropLimitLines(lines) {
  return lines.filter(function (line) {
    return line.indexOf('上限 200') < 0;
  });
}

function canAnswerLimit(lines, ask) {
  var packet = lines.concat([ask]).join('\n');
  return packet.indexOf('上限 200') >= 0;
}
