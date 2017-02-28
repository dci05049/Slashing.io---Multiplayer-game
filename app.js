var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

serv.listen(2000);
console.log("Server started.");


var Socket_List = {}; 
var player_lst = [] 

var Player = function (id) {
	var self = {
		x: 250, 
		y: 250,
		id: id,
		
	}
	return self; 
}

/*
function Players (id, x, y) {
	this.id = id; 
	this.x = x; 
	this.y = y;
}*/

 // io connection 
var io = require('socket.io')(serv,{});


// update interval 
setInterval(heartbeat, 1000); 
function heartbeat () {
	io.sockets.emit('heartbeat', player_lst); 

}

var Player = function (startX, startY) {
	this.x = startX; 
	this.y = startY; 
}


function onNewplayer (data) {
	var newPlayer = new Player(data.x, data.y);
	newPlayer.id = this.id;	
	
	var current_info = {
		id: newPlayer.id, 
		x: newPlayer.x,
		y: newPlayer.y
	}; 
	this.broadcast.emit('new_player', current_info);
	
	for (i = 0; i < player_lst.length; i++) {
		existingPlayer = player_lst[i]
		this.emit('new_player', {id: existingPlayer.id, x: existingPlayer.x, y: existingPlayer.y});
	}
	
	player_lst.push(newPlayer); 
}

function find_playerid(id) {
	console.log(player_lst.length); 
	for (var i = 0; i < player_lst.length; i++) {
		console.log('player id in lst',  player_lst[i].id);
		if (player_lst[i].id == id) {
			return player_lst[i]; 
		}
	}
	
	return false; 
}

function onMoveplayer (data) {
	var movePlayer = find_playerid(this.id); 
	
	if (!movePlayer) {
		return;
	}

	movePlayer.x = data.x; 
	movePlayer.y = data.y; 
	
	this.broadcast.emit('move_player', {id: movePlayer.id, x: movePlayer.x, y: movePlayer.y}); 
}


io.sockets.on('connection', function(socket){
    console.log("New player has connected: " + socket.id);
	
	// listen if there is a new player; 
	socket.on('new_player', onNewplayer);
	// listen if the player moves; 
	socket.on('move_player', onMoveplayer); 
	
	
	Socket_List[socket.id] = socket; 
	
	var player = Player(socket.id); 
	player_lst[socket.id] = player; 
	
	
	/*
	socket.on('update', function(player) {
		console.log(socket.id, player.x, player.y); 
		var playing; 
		for (var i in player_lst) {
			if (socket.id == player_lst[i].id) {
				playing = player_lst[i];
			}
		}
		
		playing.x = player.x;
		playing.y = player.y; 
	}); */
	
	/*
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
	*/ 
	
 
    //socket.on('happy',function(data){
    //    console.log('happy because ' + data.reason);
    //});
   
   // socket.emit('serverMsg',{
    //    msg:'hello',
    //});
   
});