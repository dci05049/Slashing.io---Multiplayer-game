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

var Player = function (startX, startY, startangle) {
	this.x = startX; 
	this.y = startY; 
	this.angle = startangle; 
}

// call this function when new player enters the game 
function onNewplayer (data) {
	var newPlayer = new Player(data.x, data.y, data.angle);
	newPlayer.id = this.id;	
	
	var current_info = {
		id: newPlayer.id, 
		x: newPlayer.x,
		y: newPlayer.y,
		angle: newPlayer.angle
	}; 
	this.broadcast.emit('new_player', current_info);
	
	for (i = 0; i < player_lst.length; i++) {
		existingPlayer = player_lst[i]
		this.emit('new_player', {id: existingPlayer.id, x: existingPlayer.x, y: existingPlayer.y, angle: existingPlayer.angle});
	}
	
	player_lst.push(newPlayer); 
}

function onPlayerAttack (data) {
	/*
	var attacking = find_playerid(data.player_id); 
	var attacked = find_playerid(data.enemy_id); 

	
	player_lst.splice(player_lst.indexOf(attacked), 1); */
	console.log('player attack');
	this.broadcast.to(data.enemy_id).emit('damaged', {id: data.enemy_id}); 
}

function onDamaged (data) {
	this.broadcast.emit('remove_player', {id: this.id}); 
		console.log ('working'); 
}

function onKilled (data) {
	var removePlayer = find_playerid(this.id); 
	console.log('killed'); 
	player_lst.splice(player_lst.indexOf(removePlayer), 1); 
	this.broadcast.emit('remove_player', {id: this.id}); 
}


// find player by the id 
function find_playerid(id) {

	for (var i = 0; i < player_lst.length; i++) {

		if (player_lst[i].id == id) {
			return player_lst[i]; 
		}
	}
	
	return false; 
}


// socket cliend has disconnected 
function onClientdisconnect() {
	var removePlayer = find_playerid(this.id); 
	
	player_lst.splice(player_lst.indexOf(removePlayer), 1); 
	
	//broadcast to all clients the removed player; 
	this.broadcast.emit('remove_player', {id: this.id}); 
}

// when the player connected to socket move, send a message to all other clietns to update the position. 
function onMoveplayer (data) {
	var movePlayer = find_playerid(this.id); 
	
	if (!movePlayer) {
		return;
	}

	movePlayer.x = data.x; 
	movePlayer.y = data.y; 
	movePlayer.angle = data.angle; 
	
	this.broadcast.emit('move_player', {id: movePlayer.id, x: movePlayer.x, y: movePlayer.y, angle: movePlayer.angle}); 
}


io.sockets.on('connection', function(socket){
	
	// listen if there is a new player; 
	socket.on('new_player', onNewplayer);
	
	// listen if the player moves; 
	socket.on('move_player', onMoveplayer); 
	
	// listen for disconnection; 
	socket.on('disconnect', onClientdisconnect); 
	
	// listen for attacks
	socket.on('player_attack', onPlayerAttack); 
	
	//listen for damaged 
	socket.on('damaged', onDamaged); 
	
	//listen if the player is killed
	socket.on('killed', onKilled); 
	
	// listen for player damaged; 
	//socket.on('player_attack', onPlayerAttack); 
	
	Socket_List[socket.id] = socket; 
	
	var player = Player(socket.id); 
	player_lst[socket.id] = player; 
	
	
});