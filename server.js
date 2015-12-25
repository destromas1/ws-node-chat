var server = require('http').createServer()
  , url = require('url')
  , WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ server: server })
  , express = require('express')
  , app = express()
  , port = 4080;


// app.use(function (req, res) {
// 
// if (req.headers['x-forwarded-proto'] !== 'https'){
//         res.redirect(['https://', req.get('host'), req.url].join(''));        
//     }else{
//         return next();
//     }
// });

app.set('port', (process.env.PORT || port));

app.use(express.static(__dirname + '/public/'));

app.get('/client',function(req,res){
  res.sendFile(__dirname+'/public/index.html');
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
  

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    wss.broadcast(message);
  });

  ws.send('Data Came from Server');
});

server.on('request', app);
server.listen(app.get('port'), function () { console.log('Listening on ' + server.address().port) });
