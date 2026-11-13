var frameBudgetMs = 16.7;
var longTaskMs = 50;

function classify(ms) {
  return {
    overFrame: ms > frameBudgetMs,
    isLongTask: ms >= longTaskMs
  };
}

console.log('20', classify(20));
console.log('50', classify(50));
console.log('16.7', classify(16.7));
