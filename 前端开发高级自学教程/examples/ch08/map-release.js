function canSymbolicate(stackRelease, mapRelease) {
  return stackRelease === mapRelease;
}

function mapOnPublicWeb(uploadedToPublicWeb) {
  return uploadedToPublicWeb === true;
}

console.log(canSymbolicate('app.goodhash.js', 'app.goodhash.js'));
console.log(canSymbolicate('app.goodhash.js', 'app.badhash.js'));
console.log(mapOnPublicWeb(false));
console.log(mapOnPublicWeb(true));
