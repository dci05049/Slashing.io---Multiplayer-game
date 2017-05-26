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
var room_List = {}; 
var loby_List = []; 
var avail_roomlist = []; 


function game_setup () {
	this.room_id;
	this.player_num = 0;
	this.max_num; 
	this.player_lst = [];
	this.speed_pickupnum = 5;
	this.stun_pickupnum = 5;
	this.pierce_pickupnum = 5;
	this.canvas_width = 4000;
	this.canvas_height = 4000;

	this.player_lst = [];
	this.top_scorer = []; 

	this.speed_pickup = [];
	this.stun_pickup = []; 
	this.pierce_pickup = [];
}

 // io connection 
var io = require('socket.io')(serv,{});

setInterval(server_handler, 1000/60);


function server_handler() {
	this.server_handle = new heartbeat(); 
}
 
function heartbeat () {
	
	for (var room in room_List) {
		room_List[room].player_lst.sort(function (a, b) {
			return b.score - a.score; 
		}); 

		//reference to the room in room list 
		var unique_room = room_List[room]; 
		
		//change the number of players in the list 
		unique_room.player_num = unique_room.player_lst.length;
		
		
		this.speed_num = unique_room.speed_pickupnum - unique_room.speed_pickup.length; 
		this.stun_num = unique_room.stun_pickupnum - unique_room.stun_pickup.length;
		this.pierce_num = unique_room.pierce_pickupnum - unique_room.pierce_pickup.length;
		
		addstun(this.stun_num, unique_room);
		addspeed(this.speed_num, unique_room); 
		addpierce(this.pierce_num, unique_room);

		if (unique_room.player_lst.length >= 5) {
			for (var i = 0; i < 5; i++) {
				unique_room.top_scorer[i] = unique_room.player_lst[i];
			}
			io.sockets.in(room).emit("leader_board", unique_room.top_scorer);
		} else {
			for (var i = 0; i < unique_room.player_lst.length; i++) {
				unique_room.top_scorer[i] = unique_room.player_lst[i];
			}
			
			io.sockets.in(room).emit("leader_board", unique_room.top_scorer);
		}
		

	}
}

function addspeed(n, room) {
	var new_speed = []; 
	
	if (n <= 0) {
		return; 
	}
	
	for (var i = 0; i < n; i++) {
		var unique_id = unique.v4(); 
		var speedentity = new speed(room.canvas_width, room.canvas_height, 'speed', unique_id);
		room.speed_pickup.push(speedentity); 
		new_speed.push(speedentity); 
		io.sockets.in(room.room_id).emit("item_update", speedentity); 
	}
	
	
}

function addstun(n, room) {
	var new_stun = []; 
	
	if (n <= 0) {
		return; 
	}
	
	for (var i = 0; i < n; i++) {
		var unique_id = unique.v4(); 
		var stunentity = new stun(room.canvas_width, room.canvas_height, 'stun', unique_id);
		room.stun_pickup.push(stunentity); 
		new_stun.push(stunentity); 
		io.sockets.in(room.room_id).emit("item_update", stunentity); 
	}
}

function addpierce(n, room) {
	var new_pierce = []; 
	
	if (n <= 0) {
		return; 
	}
	
	for (var i = 0; i < n; i++) {
		var unique_id = unique.v4(); 
		var pierceentity = new stun(room.canvas_width, room.canvas_height, 'pierce', unique_id);
		room.pierce_pickup.push(pierceentity); 
		new_pierce.push(pierceentity); 
		io.sockets.in(room.room_id).emit("item_update", pierceentity); 
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
	//set the specific id, username, and room id 
	newPlayer.id = this.id;	
	newPlayer.username = data.username;
	newPlayer.room_id = data.room_id; 
	
	
	var room = room_List[newPlayer.room_id]; 
	

	if (room.player_lst.length === 0) {
		newPlayer.first_place = true; 
	} else {
		newPlayer.first_place = false; 
	}
	
	var current_info = {
		id: newPlayer.id, 
		username: newPlayer.username,
		x: newPlayer.x,
		y: newPlayer.y,
		score: newPlayer.score, 
		angle: newPlayer.angle
	}; 
	
	this.broadcast.to(newPlayer.room_id).emit('new_player', current_info);
	
	for (i = 0; i < room.player_lst.length; i++) {
		existingPlayer = room.player_lst[i]
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
	
	

	for (j = 0; j < room.speed_pickup.length; j++) {
		var speed_pick = room.speed_pickup[j];
		this.emit('item_update', speed_pick); 
	}
	
	for (j = 0; j < room.stun_pickup.length; j++) {
		var stun_pick = room.stun_pickup[j];
		this.emit('item_update', stun_pick); 
	}
	
	for (j = 0; j < room.pierce_pickup.length; j++) {
		var pierce_pick = room.pierce_pickup[j];
		this.emit('item_update', pierce_pick); 
	}
	
	
	if (room.top_scorer.length < 10) {
		room.top_scorer.push(newPlayer); 
	}
	
	room.player_lst.push(newPlayer); 
}

function onPlayerAttack (data) {
	
	var attacking = find_playerid(data.player_id, this.room); 
	var attacked = find_playerid(data.enemy_id, this.room); 
	var pierce = data.pierce;


	this.broadcast.to(data.enemy_id).emit('damaged', {id: data.enemy_id, by_id: data.player_id, pierce: pierce}); 
}

function onDamaged (data) {
 
}

function onKilled (data) {
	var room = this.room;
	var room_id = this.room_id;
	
	var removePlayer = find_playerid(this.id, room); 
	//get rid of players in player list and top_score lists
	var topplayer = find_topscorer(this.id, room); 
	
	console.log(removePlayer.value); 
	
	if (removePlayer) {
		room.player_lst.splice(room.player_lst.indexOf(removePlayer), 1);
		room.player_num--;
		avail_roomlist.push(this.room_id); 
	}
	if (topplayer) {
		room.top_scorer.splice(room.top_scorer.indexOf(topplayer), 1);
	}
	
	//db.account.insert({username: info.username, score: info.score});
	this.emit('killed'); 
	this.broadcast.to(data.by_id).emit('gained_point', {username: removePlayer.username, id: removePlayer.id, value: removePlayer.value, pierce: data.pierce}); 
	
	this.broadcast.to(room_id).emit('remove_player', {id: this.id, killed: true}); 
}



function onGained (data) {
	var player = find_playerid(this.id, this.room);
	player.value += data.value; 
	player.score += data.player_score; 
}

function onStunned (data) {
	var stunned = find_playerid(data.player_id, this.room); 
	var enemyPlayer = find_playerid(data.enemy_id, this.room); 
	this.emit('stunned', {id: enemyPlayer.id, username: enemyPlayer.username}); 
}

function score_update (data) {

}


function find_topscorer(id, room) {
	for (var i = 0; i < room.top_scorer.length; i++) {

		if (room.top_scorer[i].id == id) {
			return room.top_scorer[i]; 
		}
	}
	
	return false;
}

// find player by the id 
function find_playerid(id, room) {

	for (var i = 0; i < room.player_lst.length; i++) {

		if (room.player_lst[i].id == id) {
			return room.player_lst[i]; 
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
	
	//find the room that the player is in. 
	var room = this.room;
	//only send the remove player message when the player enters the actual game (room)
	if (room) {
		var removePlayer = find_playerid(this.id, room); 
		var topplayer = find_topscorer(this.id, room); 
		
		if (removePlayer) {
			room.player_lst.splice(room.player_lst.indexOf(removePlayer), 1);
			room.player_num--; 
			avail_roomlist.push(this.room_id);
		}
		if (topplayer) {
			room.top_scorer.splice(room.top_scorer.indexOf(topplayer), 1);
		}
		
		//if (info.username) {
			//db.account.insert({username: info.username, score: info.score}); 
		//}
		
		
		//broadcast to all clients the removed player; 
		this.broadcast.emit('remove_player', {id: this.id});
	}	
}

// when the player connected to socket move, send a message to all other clietns to update the position. 
function onMoveplayer (data) {


	var movePlayer = find_playerid(this.id, this.room); 
	var room = this.room;
	
	
	if (!movePlayer) {
		return;
		console.log('no player'); 
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
	if (room.top_scorer[0].id === movePlayer.id) {
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
	
	this.broadcast.to(this.room_id).emit('move_player', data); 
}

function onitemPicked (data) {
	//the room that the item is in;
	var room = this.room; 
	
	if (data.type === 'speed') {
		var object = find_item(data.id, room.speed_pickup.length, room.speed_pickup); 
		room.speed_pickup.splice(room.speed_pickup.indexOf(object), 1);
	} else if (data.type === 'stun') {
		var object = find_item(data.id, room.stun_pickup.length, room.stun_pickup); 
		room.stun_pickup.splice(room.stun_pickup.indexOf(object), 1);
	} else if (data.type === 'pierce') {
		var object = find_item(data.id, room.pierce_pickup.length, room.pierce_pickup); 
		room.pierce_pickup.splice(room.pierce_pickup.indexOf(object), 1);
		var player = find_playerid(this.id, room); 
		player.pierce = true; 
	}
	
	if (object === false) {
		console.log('cannot be found' + object.id);
	} 
	
	io.sockets.in(this.room_id).emit('itemremove', object); 
}

function onLoggedin () {
	this.emit('enter_game'); 
}

function onEntername (data) {
	
	var room_id = find_Roomid(); 
	var room = room_List[room_id]; 
	
	//join the room; 
	this.room_id = room_id;
	this.room = room;
	this.join(this.room_id);
	room.player_num+=1; 

		
	var index = avail_roomlist.indexOf(room_id);
	
	console.log(room.max_num); 
	console.log(room.player_num);
	if(room.player_num >= room.max_num) {
		avail_roomlist.splice(index, 1); 
	}
	

	
	this.emit('join_game', {username: data.username, id: this.id, room_id: this.room_id});
}

function find_Roomid() {
	var room_number = getRndInteger(0, avail_roomlist.length - 1); 
	
	var room_id = avail_roomlist[room_number]; 
	if (room_id) {
		return room_id; 
	} else {
		create_Room();
		room_id = avail_roomlist[room_number];
		return room_id; 
	}
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function create_Room() {
	var new_roomid = unique.v4();
	var new_game = new game_setup();
	new_game.room_id = new_roomid;
	var max_playernum = find_maxPlayer(); 
	new_game.max_num = max_playernum; 
	
	var new_speed;
	var new_stun;
	var new_pierce;
	
	addspeed(new_game.speed_num, new_game); 
	addstun(new_game.stun_num, new_game);
	addpierce(new_game.pierce_num, new_game); 
	
	room_List[new_roomid] = new_game; 
	
	avail_roomlist.push(new_roomid);
}

function find_maxPlayer() {
	return 10;
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
	
	
});