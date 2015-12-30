// The SW will be shutdown when not in use to save memory,
// be aware that any global state is likely to disappear
console.log("SW startup");

importScripts('serviceworker-cache-polyfill.js');

self.addEventListener('install', function(event) {
  console.log("SW installed");
  // pre cache a load of stuff:
  event.waitUntil(
    caches.open('static-v1').then(function(cache) {
      return cache.addAll([
        '/',
        '/style.css',
        '/index.html',
        '/init.js',
        '/app.js',
        '/worker.js',
        '/serviceworker-cache-polyfill.js',
        '/favicon.ico'
      ]);
    })
  )
});

self.addEventListener('activate', function(event) {
  console.log("SW activated");
});

self.addEventListener('fetch', function(event) {
    console.log("Caught a fetch!!!");
        
    event.respondWith(caches.match(event.request).then(function(response) {
         return response || fetch(event.request);
     })
  );
});

self.addEventListener('push', function(event) {  
  console.log('Received a push message', event);

  var title = 'New Msg';  
  var body = 'You have received a push message.';
  var tag = 'simple-push-demo-notification-tag';

  event.waitUntil(  
    self.registration.showNotification(title, {  
      body: body,  
      icon: undefined,  
      tag: tag  
    })
  );  
});

