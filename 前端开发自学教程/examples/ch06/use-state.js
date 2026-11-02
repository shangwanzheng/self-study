var pair = useState({ stock: 8 });
var snapshot = pair[0];
var setSnapshot = pair[1];

function wrong(nextStock) {
  snapshot.stock = nextStock;
  setSnapshot(snapshot);
}

function right(nextStock) {
  setSnapshot({ stock: nextStock });
}
