var server = require('http').createServer()
  , url = require('url')
  , request = require('request-promise')
  , WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ server: server })
  , express = require('express')
  , bodyParser = require('body-parser')
  , textEncoder = require('text-encoding').TextEncoder
  , request = require('request-promise')
  , crypto = require('crypto')
  , bodyParser = require('body-parser')
  , ece = require('http_ece')
  , base64 = require('base64url')
  , app = express()
  , port = 4080;

  var GCM_ENDPOINT = 'https://android.googleapis.com/gcm/send';
  var GCM_AUTHORIZATION = 'AIzaSyCjcwmuqTKncpXWf_kItRpImxqrM7TU9-k';

// app.use(function (req, res) {
// 
// if (req.headers['x-forwarded-proto'] !== 'https'){
//         res.redirect(['https://', req.get('host'), req.url].join(''));        
//     }else{
//         return next();
//     }
// });

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


app.set('port', (process.env.PORT || port));

app.use(express.static(__dirname + '/public/'));

app.get('/client',function(req,res){
  res.sendFile(__dirname+'/public/index.html');
});

// app.use(function (req, res) {
//   res.send({ msg: "Server Initiated" });
// });

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


function encryptMessage(payload, keys) {
  if (crypto.getCurves().indexOf('prime256v1') === -1) {
    // We need the P-256 Diffie Hellman Elliptic Curve to generate the server
    // certificates
    // secp256r1 === prime256v1
    console.log('We don\'t have the right Diffie Hellman curve to work.');
    return;
  }

  console.log(keys);

  var ellipticDHCurve = crypto.createECDH('prime256v1');
  ellipticDHCurve.generateKeys();

  var sharedSecret = ellipticDHCurve.computeSecret(keys.p256dh, 'base64');
  ece.saveKey('simple-push-demo', sharedSecret);

  var salt = crypto.randomBytes(16);
  var cipherText = ece.encrypt(payload, {
    keyid: 'simple-push-demo',
    salt: base64.encode(salt)
  });

  return {
    payload: cipherText,
    headers: {
      'Content-Length': cipherText.length,
      'Content-Type': 'application/octet-stream',
      'Encryption-Key': 'keyid=p256dh;dh=' +
        base64.encode(ellipticDHCurve.getPublicKey()),
      'Encryption': 'keyid=p256dh;salt=' +
        base64.encode(salt),
      'Content-Encoding': 'aesgcm128'
    }
  };
}


function sendPushMessage(endpoint, keys) {
  var options = {
    uri: endpoint,
    method: 'POST',
    resolveWithFullResponse: true,
    headers: {}
  };
  if (keys) {
    var encryptedPayload = encryptMessage('Please Work.', keys);
    options.headers = encryptedPayload.headers;
    options.body = encryptedPayload.cipherText;
    console.log(options);
  }

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
  var keys = req.body.keys;
  if (!endpoint) {
    // If there is no endpoint we can't send anything
    return res.status(404).json({success: false});
  }

  sendPushMessage(endpoint, keys)
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
