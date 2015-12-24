jQuery(document).ready(function ($) {
	var content = $('#content');

	var ws = new WebSocket('ws://localhost:4080');

	ws.onopen = function () {
		console.log('Connected');
	};

	$('#btnChat').click(function () {
		console.log("9999999999999");

		var message = $('#input').val();

		console.log(message);

		ws.send(message);
	});


	ws.onmessage = function (msg) {
		console.log('Received message from server: ' + msg.data);
		addMessage(msg.data);
	}

	function addMessage(message) {
		content.prepend('<p><span>' + message + '</span></p>');
	}
});