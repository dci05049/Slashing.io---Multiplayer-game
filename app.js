var express = require('express');
var unique = require('node-uuid'); 
var app = express();
var serv = require('http').Server(app);

//mongodb 
//var mongojs = require("mongojs");
//var db = mongojs('localhost:27017/knightIO', ['account', 'data']);


app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));


var speed = require('./entity/speed.js');
var stun = require('./entity/stun.js');
var pierce = require('./entity/stun.js');


serv.listen(process.env.PORT || 2000);
console.log("Server started.");


var Socket_List = {}; 
var player_lst = [];
var top_scorer = []; 

var speed_pickup = [];
var stun_pickup = []; 
var pierce_pickup = [];


var game_setup = {
	speed_pickupnum: 5,
	stun_pickupnum: 5, 
	pierce_pickupnum: 5,
	canvas_width: 1920,
	canvas_height: 1920
}

var info = {
	username: 'undefined', 
	id: 'undefined',
	score: 0
}


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
	this.stun_num = game_setup.stun_pickupnum - stun_pickup.length;
	this.pierce_num = game_setup.pierce_pickupnum - pierce_pickup.length;
	
	addstun(this.stun_num);
	addspeed(this.speed_num); 
	addpierce(this.pierce_num);
	

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
		var speedentity = new speed(game_setup.canvas_width, game_setup.canvas_height, 'speed', unique_id);
		speed_pickup.push(speedentity); 
		new_speed.push(speedentity); 
		io.sockets.emit("item_update", speedentity); 
	}
}

function addstun(n) {
	var new_stun = []; 
	
	if (n <= 0) {
		return; 
	}
	
	for (var i = 0; i < n; i++) {
		var unique_id = unique.v4(); 
		var stunentity = new stun(game_setup.canvas_width, game_setup.canvas_height, 'stun', unique_id);
		stun_pickup.push(stunentity); 
		new_stun.push(stunentity); 
		io.sockets.emit("item_update", stunentity); 
	}
}

function addpierce(n) {
	var new_pierce = []; 
	
	if (n <= 0) {
		return; 
	}
	
	for (var i = 0; i < n; i++) {
		var unique_id = unique.v4(); 
		var pierceentity = new stun(game_setup.canvas_width, game_setup.canvas_height, 'pierce', unique_id);
		pierce_pickup.push(pierceentity); 
		new_pierce.push(pierceentity); 
		io.sockets.emit("item_update", pierceentity); 
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
	this.value = 100; 
	
	this.shield_x = startX; 
	this.shield_y = startY; 
	this.shield_angle = startangle; 
	this.attacking = false; 
	this.first_place; 
}

// call this function when new player enters the game 
function onNewplayer (data) {
	var newPlayer = new Player(data.x, data.y, data.angle);
	newPlayer.id = this.id;	
	newPlayer.username = info.username;
	
	
	if (player_lst.length === 0) {
		newPlayer.first_place = true; 
	} else {
		newPlayer.first_place = false; 
	}
	
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
		var player_info = {
			id: existingPlayer.id,
			username: existingPlayer.username,
			x: existingPlayer.x,
			y: existingPlayer.y, 
			score: existingPlayer.score,
			angle: existingPlayer.angle,			
		};
		this.emit('new_player', player_info);
	}
	
	
	// give the player the items in the speed pickup list 
	for (j = 0; j < speed_pickup.length; j++) {
		var speed_pick = speed_pickup[j];
		this.emit('item_update', speed_pick); 
	}
	
	for (j = 0; j < stun_pickup.length; j++) {
		var stun_pick = stun_pickup[j];
		this.emit('item_update', stun_pick); 
	}
	
	for (j = 0; j < pierce_pickup.length; j++) {
		var pierce_pick = pierce_pickup[j];
		this.emit('item_update', pierce_pick); 
	}
	
	
	if (top_scorer.length < 10) {
		top_scorer.push(newPlayer); 
	}
	player_lst.push(newPlayer); 
}

function onPlayerAttack (data) {
	
	var attacking = find_playerid(data.player_id); 
	var attacked = find_playerid(data.enemy_id); 
	var pierce = data.pierce;


	this.broadcast.to(data.enemy_id).emit('damaged', {id: data.enemy_id, by_id: data.player_id, pierce: pierce}); 
}

function onDamaged (data) {
 
}

function onKilled (data) {
	var removePlayer = find_playerid(this.id); 
	//get rid of players in player list and top_score lists
	var topplayer = find_topscorer(this.id); 
	
	console.log(removePlayer.value); 
	
	if (removePlayer) {
		player_lst.splice(player_lst.indexOf(removePlayer), 1);
	}
	if (topplayer) {
		top_scorer.splice(top_scorer.indexOf(topplayer), 1);
	}
	
	//db.account.insert({username: info.username, score: info.score});
	this.emit('restart_game'); 
	this.broadcast.to(data.by_id).emit('gained_point', {username: removePlayer.username , value: removePlayer.value, pierce: data.pierce}); 	
	this.broadcast.emit('remove_player', {id: this.id}); 
}

function onGained (data) {
	var player = find_playerid(this.id);
	player.value += data.value; 
	player.score += data.player_score; 
	info.score = player.score;
}

function onStunned (data) {
	var stunned = find_playerid(data.player_id); 
	var enemyPlayer = find_playerid(data.enemy_id); 
	this.emit('stunned', {username: enemyPlayer.username}); 
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

function find_item(id, length, list_item) {
	for (var i = 0; i < length; i++) {

		if (list_item[i].id == id) {
			return list_item[i]; 
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
	
	if (info.username) {
		//db.account.insert({username: info.username, score: info.score}); 
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
	
	//check if the moving player is in first place
	if (top_scorer[0].id === movePlayer.id) {
		movePlayer.first_place = true; 
	} else {
		movePlayer.first_place = false; 
	}
	
	//check if the moving player is attacking 
	if (data.attacking === true) {
		movePlayer.attacking = true; 
	} else {
		movePlayer.attacking = false; 
	}
	
	
	//if the player has piercing skill,
	if (data.pierce === true) {
		movePlayer.pierce = true;
	} else {
		movePlayer.pierce = false;
	}
	
	
	var data = {
		id: movePlayer.id, 
		x: movePlayer.x, 
		y: movePlayer.y, 
		angle: movePlayer.angle,
		sword_x: movePlayer.sword_x,
		sword_y: movePlayer.sword_y, 
		sword_angle: movePlayer.sword_angle, 
		
		shield_x: movePlayer.shield_x,
		shield_y: movePlayer.shield_y, 
		shield_angle:movePlayer.shield_angle,
		
		attacking: movePlayer.attacking,
		pierce: movePlayer.pierce,
		first_place: movePlayer.first_place
	}
	
	this.broadcast.emit('move_player', data); 
}

function onitemPicked (data) {
	if (data.type === 'speed') {
		var object = find_item(data.id, speed_pickup.length, speed_pickup); 
		speed_pickup.splice(speed_pickup.indexOf(object), 1);
	} else if (data.type === 'stun') {
		var object = find_item(data.id, stun_pickup.length, stun_pickup); 
		stun_pickup.splice(stun_pickup.indexOf(object), 1);
	} else if (data.type === 'pierce') {
		var object = find_item(data.id, pierce_pickup.length, pierce_pickup); 
		pierce_pickup.splice(pierce_pickup.indexOf(object), 1);
		
		var player = find_playerid(this.id); 
		player.pierce = true; 
	}
	
	if (object === false) {
		console.log('cannot be found' + object.id);
	}
	
	io.emit('itemremove', object); 
}

function onLoggedin () {
	console.log(info);
	this.emit('enter_game', {info: info}); 
}

function onEntername (data) {
	
	info.username = data.username;
	info.id = this.id; 
	console.log(this.id); 
	this.emit('join_game');
}


io.sockets.on('connection', function(socket){
	
	socket.on('enter_name', onEntername); 
	
	socket.on('logged_in', onLoggedin); 
	
	// listen if there is a new player; 
	socket.on('new_player', onNewplayer);
	
	// listen if the player moves; 
	socket.on('move_player', onMoveplayer); 
	
	// listen for disconnection; 
	socket.on('disconnect', onClientdisconnect); 
	
	//listen if the player is stunned 
	socket.on('player_stunned', onStunned); 
	
	// listen for attacks
	socket.on('player_attack', onPlayerAttack); 
	
	//listen for damaged 
	socket.on('damaged', onDamaged); 
	
	//listen if the player is killed
	socket.on('killed', onKilled); 

	
	//listen for the score update 
	socket.on('new_score', score_update); 
	
	//listen if player killed 
	socket.on('gained', onGained);

	//listen if player got items 
	socket.on('item_picked', onitemPicked); 
	
	
	
	Socket_List[socket.id] = socket; 
	
	var player = Player(socket.id); 
	player_lst[socket.id] = player; 
	
	
});