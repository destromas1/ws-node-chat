var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({port:9001});

// wss.broadcast = function(data) {
//   for (var i in this.clients)
//     this.clients[i].send(data);
// };

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
};

// use like this:
wss.on('connection', function(ws) {
  ws.on('message', function(message) {
    wss.broadcast(message);
  });
});

console.log(wss.port);
