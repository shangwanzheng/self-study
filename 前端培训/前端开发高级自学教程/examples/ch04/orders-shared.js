var ports = [];
var connection = null;

onconnect = function (e) {
  var port = e.ports[0];
  ports.push(port);
  if (!connection) connection = { name: 'orders' };
  port.onmessage = function (ev) {
    var i;
    for (i = 0; i < ports.length; i++) {
      ports[i].postMessage({ via: connection.name, body: ev.data });
    }
  };
  port.start();
};
