var server = require('http').createServer()
  , url = require('url')
  , request = require('request-promise')
  , WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ server: server })
  , express = require('express')
  , bodyParser = require('body-parser')
  , request = require('request-promise')
  , app = express()
  , port = 4080;

var GCM_ENDPOINT = 'https://android.googleapis.com/gcm/send';
var GCM_AUTHORIZATION = 'AIzaSyCjcwmuqTKncpXWf_kItRpImxqrM7TU9-k';


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


app.set('port', (process.env.PORT || port));

app.use(express.static(__dirname + '/public/'));

app.get('/client',function(req,res){
  res.sendFile(__dirname+'/public/index.html');
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

function sendPushMessage(endpoint) {
  var options = {
    uri: endpoint,
    method: 'POST',
    resolveWithFullResponse: true,
    headers: {}
  };
  
  console.log(options);

  if (endpoint.indexOf('https://android.googleapis.com/gcm/send') === 0) {
    // Proprietary GCM
    var endpointParts = endpoint.split('/');
    var gcmRegistrationId = endpointParts[endpointParts.length - 1];

    // Rename the request URI to not include the GCM registration ID
    options.uri = GCM_ENDPOINT;

    options.headers['Content-Type'] = 'application/json';
    options.headers.Authorization = 'key=' + GCM_AUTHORIZATION;

    // You can use a body of:
    // registration_ids: [<gcmRegistrationId>, <gcmRegistrationId>...]
    // for multiple registrations.
    options.body = JSON.stringify({
      'to': gcmRegistrationId
    });
  }

  console.log(options);

  return request(options)
  .then(function(response){
    if (response.body.indexOf('Error') === 0) {
      // GCM has a wonderful habit of returning 'Error=' for some problems
      // while keeping the status code at 200. This catches that case
      throw new Error('Problem with GCM. "' + response + '"');
    }

    if (response.statusCode !== 200 &&
      response.statusCode !== 201) {
      throw new Error('Unexpected status code from endpoint. "' +
        response.statusCode + '"');
    }

    if (options.uri === GCM_ENDPOINT) {
      try {
        var responseObj = JSON.parse(response);
        if (responseObj.failures) {
          // This endpoint needs to be removing from your database

        }
      } catch (exception) {
        // NOOP
      }
    }

    return response;
  });
}


app.post('/send_web_push', function(req, res) {
    
  console.log('send_web_push');
    
  var endpoint = req.body.endpoint;  

  sendPushMessage(endpoint)
  .then(function(responseText){
    console.log('Request success');
    // Check the response from GCM

    res.json({success: true});
  })
  .catch(function(err){
    console.log('Problem with request', err);
    res.json({success: false});
  });
  
});


server.on('request', app);
server.listen(app.get('port'), function () { console.log('Listening on ' + server.address().port) });
