document.addEventListener("DOMContentLoaded", function(event) {
   
    var content = document.getElementById('content');
    
    var WS_SERVER = 'ws://localhost:4080';
    
    var url = window.location.href;
        if (url.indexOf("localhost") < 0) {
        WS_SERVER = 'wss://glacial-wildwood-7266.herokuapp.com';
    }
    
    var ws = new WebSocket(WS_SERVER);  

	ws.onopen = function () {
		console.log('Connected');
	};
    
    
    // document.getElementById("btnChat").onclick = function() {
    //     onButtonClicked();
    // };
    
    document.getElementById("input").addEventListener("keydown", function(e) {
        if (e.keyCode == 13) { 
            onButtonClicked();
        }
    }, false);
    
    function onButtonClicked(){
        var message = document.getElementById('input').value;
		console.log(message);
		ws.send(message);
        sendWebPush();
    }
    
	ws.onmessage = function (msg) {
		console.log('Received message from server: ' + msg.data);
		addMessage(msg.data);
	}

	function addMessage(message) {
       var inner = document.createElement("p");
       inner.innerHTML = message;
       content.appendChild(inner);
       content.insertBefore(inner, content.firstChild);
	}

});

