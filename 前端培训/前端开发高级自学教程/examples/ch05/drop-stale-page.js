function applyArrival(addressPage, responsePage) {
  if (responsePage !== addressPage) {
    return { shown: addressPage, dropped: responsePage };
  }
  return { shown: responsePage, dropped: null };
}
