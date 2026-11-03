function sourceMapGate(uploadPublic) {
  var onPublicWeb = !!uploadPublic;
  return {
    onPublicWeb: onPublicWeb,
    canDownload: onPublicWeb ? '能' : '不能'
  };
}
