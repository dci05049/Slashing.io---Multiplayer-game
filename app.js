var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

serv.listen(2000);
console.log("Server started.");

var player_lst = []; 

function Players (id, x, y) {
	this.id = id; 
	this.x = x; 
	this.y = y;
}
 
var io = require('socket.io')(serv,{});


setInterval(heartbeat, 1000); 
function heartbeat () {
	io.sockets.emit('heartbeat', player_lst); 
}

io.sockets.on('connection', function(socket){
    console.log("New player has connected: " + socket.id);
	
	var new_player = new Players(socket.id, 0, 0); 
	player_lst.push(new_player); 
	
	socket.on('update', function(data) {
		console.log(socket.id, data.x, data.y);
		var playing; 
		for (var i = 0; i < player_lst.length; i++) {
			if (socket.id == player_lst[i].id) {
				playing = player_lst[i]; 
			}
		}
		
		playing.x = data.x; 
		playing.y = data.y; 
		
	});
 
    //socket.on('happy',function(data){
    //    console.log('happy because ' + data.reason);
    //});
   
   // socket.emit('serverMsg',{
    //    msg:'hello',
    //});
   
});