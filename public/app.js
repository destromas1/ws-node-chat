jQuery(document).ready(function ($) {
	var content = $('#content');
    
    var WS_SERVER = 'ws://localhost:4080';
    
    var url = window.location.href;
        if (url.indexOf("localhost") < 0) {
        WS_SERVER = 'wss://glacial-wildwood-7266.herokuapp.com';
    }
    
    var ws = new WebSocket(WS_SERVER);  

	ws.onopen = function () {
		console.log('Connected');
	};

	$('#btnChat').click(function () {               
		var message = $('#input').val();
		console.log(message);
		ws.send(message);
        sendWebPush();
	});


	ws.onmessage = function (msg) {
		console.log('Received message from server: ' + msg.data);
		addMessage(msg.data);
	}

	function addMessage(message) {
		content.prepend('<p><span>' + message + '</span></p>');
	}
});
