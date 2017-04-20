var express = require('express');
var unique = require('node-uuid'); 
var app = express();
var serv = require('http').Server(app);




app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

var speed = require('./entity/speed.js');

serv.listen(2000);
console.log("Server started.");


var Socket_List = {}; 
var player_lst = [];
var top_scorer = []; 

var speed_pickup = [];

var game_setup = {
	speed_pickupnum: 20,
	canvas_width: 1920,
	canvas_height: 1920
}

var info = {
	username: 'undefined', 
	id: 'undefined'
}

/*
var Player = function (id, username) {
	var self = {
		x: 250, 
		y: 250,
		id: id,
		username: username
	}
	return self; 
}
*/

/*
function Players (id, x, y) {
	this.id = id; 
	this.x = x; 
	this.y = y;
}*/

 // io connection 
var io = require('socket.io')(serv,{});

setInterval(server_handler, 1000/60);


function server_handler() {
	this.server_handle = new heartbeat(); 
}
 
function heartbeat () {
	
	player_lst.sort(function (a, b) {
		return b.score - a.score; 
	}); 
	
	this.speed_num = game_setup.speed_pickupnum - speed_pickup.length; 
	addspeed(this.speed_num); 
	

	if (player_lst.length >= 5) {
		for (var i = 0; i < 5; i++) {
			top_scorer[i] = player_lst[i];
		}
		io.sockets.emit("leader_board", top_scorer);
	} else {
		for (var i = 0; i < player_lst.length; i++) {
			top_scorer[i] = player_lst[i];
		}
		
		io.sockets.emit("leader_board", top_scorer);
	}
	if (player_lst[0]) {

	}
}

function addspeed(n) {
	var new_speed = []; 
	
	if (n <= 0) {
		return; 
	}
	
	for (var i = 0; i < n; i++) {
		var unique_id = unique.v4(); 
		var speedentity = new speed(game_setup.canvas_width, game_setup.canvas_height, unique_id);
		speed_pickup.push(speedentity); 
		new_speed.push(speedentity); 
		io.sockets.emit("item_update", {speed_pickup: speedentity}); 
	}
}


var Player = function (startX, startY, startangle) {
	this.x = startX; 
	this.y = startY; 
	this.angle = startangle; 
	this.sword_x = startX; 
	this.sword_y = startY; 
	this.sword_angle = startangle; 
	this.score = 0; 
	
	this.shield_x = startX; 
	this.shield_y = startY; 
	this.shield_angle = startangle; 
}

// call this function when new player enters the game 
function onNewplayer (data) {
	var newPlayer = new Player(data.x, data.y, data.angle);
	newPlayer.id = this.id;	
	newPlayer.username = info.username;
	
	var current_info = {
		id: newPlayer.id, 
		username: info.username, 
		x: newPlayer.x,
		y: newPlayer.y,
		score: newPlayer.score, 
		angle: newPlayer.angle
	}; 
	this.broadcast.emit('new_player', current_info);
	
	for (i = 0; i < player_lst.length; i++) {
		existingPlayer = player_lst[i]
		this.emit('new_player', {id: existingPlayer.id, x: existingPlayer.x, y: existingPlayer.y, angle: existingPlayer.angle});
	}
	
	for (j = 0; j < speed_pickup.length; j++) {
		var speed_pick = speed_pickup[j];
		this.emit('item_update', {speed_pickup: speed_pick}); 
	}
	
	if (top_scorer.length < 10) {
		top_scorer.push(newPlayer); 
	}
	player_lst.push(newPlayer); 
}

function onPlayerAttack (data) {
	
	var attacking = find_playerid(data.player_id); 
	var attacked = find_playerid(data.enemy_id); 


	this.broadcast.to(data.enemy_id).emit('damaged', {id: data.enemy_id, by_id: data.player_id}); 
}

function onDamaged (data) {
 
}

function onKilled (data) {
	var removePlayer = find_playerid(this.id); 
	//get rid of players in player list and top_score lists
	var topplayer = find_topscorer(this.id); 
	
	if (removePlayer) {
		player_lst.splice(player_lst.indexOf(removePlayer), 1);
	}
	if (topplayer) {
		top_scorer.splice(top_scorer.indexOf(topplayer), 1);
	}
	
	this.emit('restart_game'); 
	this.broadcast.to(data.by_id).emit('gained_point', {id: data.id}); 	
	this.broadcast.emit('remove_player', {id: this.id}); 
}

function onGained (data) {
	var player = find_playerid(this.id);
	player.score += 1; 
}

function onStunned (data) {
	var stunned = find_playerid(data.player_id); 
	
	//player_lst.splice(player_lst.indexOf(attacked), 1); 
	console.log('player blocked');
	this.emit('stunned', {id: data.enemy_id}); 
}

function score_update (data) {

}


function find_topscorer(id) {
	for (var i = 0; i < top_scorer.length; i++) {

		if (top_scorer[i].id == id) {
			return top_scorer[i]; 
		}
	}
	
	return false;
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

function find_item(id) {
	for (var i = 0; i < speed_pickup.length; i++) {

		if (speed_pickup[i].id == id) {
			return speed_pickup[i]; 
		}
	}
	
	return false; 
}


// socket cliend has disconnected 
function onClientdisconnect() {
	console.log('disconnect'); 
	
	var removePlayer = find_playerid(this.id); 
	var topplayer = find_topscorer(this.id); 
	
	if (removePlayer) {
		player_lst.splice(player_lst.indexOf(removePlayer), 1);
	}
	if (topplayer) {
		top_scorer.splice(top_scorer.indexOf(topplayer), 1);
	}
	
	
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
	movePlayer.sword_x = data.sword_x;
	movePlayer.sword_y = data.sword_y; 
	movePlayer.sword_angle = data.sword_angle; 
	movePlayer.shield_x = data.shield_x;
	movePlayer.shield_y = data.shield_y;
	movePlayer.shield_angle = data.shield_angle; 
	
	this.broadcast.emit('move_player', {id: movePlayer.id, x: movePlayer.x, y: movePlayer.y, angle: movePlayer.angle, sword_x: movePlayer.sword_x,
	sword_y: movePlayer.sword_y, sword_angle: movePlayer.sword_angle, shield_x: movePlayer.shield_x, shield_y: movePlayer.shield_y, shield_angle:movePlayer.shield_angle }); 
}

function itemPicked (data) {
	if (data.type === 'speed') {
		var object = find_item(data.id); 
		speed_pickup.splice(speed_pickup.indexOf(object), 1);
	}
	
	io.emit('itemremove', {id: data.id}); 
}

function onLoggedin (data) {
	this.emit('enter_game'); 
}

function onEntername (data) {
	info.username = data.username;
	console.log(this.id); 
	this.emit('join_game');
}


io.sockets.on('connection', function(socket){
	
	info.id = socket.id; 
	
	socket.on('enter_name', onEntername); 
	
	socket.on('logged_in', onLoggedin); 
	
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
	
	//listen if the player is stunned 
	socket.on('player_stunned', onStunned); 
	
	//listen for the score update 
	socket.on('new_score', score_update); 
	
	//listen if player killed 
	socket.on('gained', onGained);

	//listen if player got items 
	socket.on('item_picked', itemPicked); 
	
	
	// listen for player damaged; 
	//socket.on('player_attack', onPlayerAttack); 
	
	Socket_List[socket.id] = socket; 
	
	var player = Player(socket.id); 
	player_lst[socket.id] = player; 
	
	
});