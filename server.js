var server = require('http').createServer()
  , url = require('url')
  , WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ server: server })
  , express = require('express')
  , app = express()
  , port = 4080;

app.use(express.static(__dirname + '/public/'));

app.get('/client',function(req,res){
  res.sendFile(__dirname+'/public/index.html');
  //__dirname : It will resolve to your project folder.
});


app.use(function (req, res) {
  res.send({ msg: "Server Initiated" });
});

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
};


wss.on('connection', function connection(ws) {
  var location = url.parse(ws.upgradeReq.url, true);
  console.log(location);
  // you might use location.query.access_token to authenticate or share sessions
  // or ws.upgradeReq.headers.cookie (see http://stackoverflow.com/a/16395220/151312)

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    wss.broadcast(message);
  });

  ws.send('Data Came from Server');
});

server.on('request', app);
server.listen(port, function () { console.log('Listening on ' + server.address().port) });






/*


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


*/

