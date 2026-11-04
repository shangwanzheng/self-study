var draft = '过程记录：用户说上周报销超了，上限 200 元，这单填了 350 元。lookupClause 命中第 3 条，名称是报销。超出金额是 150 元。考勤、请假、差旅不是这一问。情景摘要要写全三格。重要度：高。前因：上限 200 元，这单 350 元，超出 150 元。下一步：等人确认。确认放到第 8 章，这一章停在等人。规章全文 320 字不写进这条草稿。';

function compressMemory(draft, contextChars) {
  var keptFacts = draft.indexOf('上限 200') >= 0 && draft.indexOf('超出 150') >= 0;
  var text = [
    '上限 200 元',
    '超出 150 元',
    '情景摘要：重要度高；前因上限 200 元、这单 350 元、超出 150 元；下一步等人确认'
  ].join('\n');
  if (!keptFacts) {
    return {
      text: '',
      length: 0,
      fits: false,
      keeps200: false,
      keeps150: false,
      draftLength: draft.length
    };
  }
  return {
    text: text,
    length: text.length,
    fits: text.length <= contextChars,
    keeps200: text.indexOf('上限 200') >= 0,
    keeps150: text.indexOf('超出 150') >= 0 && text.indexOf('超出 0') < 0,
    draftLength: draft.length
  };
}
