var express = require('express');
// p2 physcis
var p2 = require('p2'); 
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


var speed = require('./server/entity/speed.js');
var stun = require('./server/entity/stun.js');
var pierce = require('./server/entity/stun.js');
var food = require('./server/entity/food.js'); 
var physicsPlayer = require('./server/physics/playermovement.js');


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
	this.food_pickupnum = 100; 
	this.speed_pickupnum = 10;
	this.stun_pickupnum = 10;
	this.pierce_pickupnum = 10;
	this.canvas_width = 4000;
	this.canvas_height = 4000;

	this.player_lst = [];
	this.top_scorer = []; 

	this.food_pickup = []; 
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

var world = new p2.World({
  gravity : [0,0]
});

//needed for physics update 
var lastTime;
var timeStep= 1/70; 


var startTime = (new Date).getTime();

function heartbeat () {
	
	for (var room in room_List) {
		room_List[room].player_lst.sort(function (a, b) {
			return b.score - a.score; 
		}); 

		//reference to the room in room list 
		var unique_room = room_List[room]; 
		
		//change the number of players in the list 
		unique_room.player_num = unique_room.player_lst.length;
		
		this.food_num = unique_room.food_pickupnum - unique_room.food_pickup.length; 
		this.speed_num = unique_room.speed_pickupnum - unique_room.speed_pickup.length; 
		this.stun_num = unique_room.stun_pickupnum - unique_room.stun_pickup.length;
		this.pierce_num = unique_room.pierce_pickupnum - unique_room.pierce_pickup.length;
		
		addfood(this.food_num, unique_room);
		addstun(this.stun_num, unique_room);
		addspeed(this.speed_num, unique_room); 
		addpierce(this.pierce_num, unique_room);
		
		
		if (unique_room.player_lst.length >= 5) {
			for (var i = 0; i < 5; i++) {
				var player = unique_room.player_lst[i]; 
				
				var top_player = {
					id: player.id, 
					username: player.username
				}
				
				unique_room.top_scorer[i] = top_player;
			}
			io.sockets.in(room).emit("leader_board", unique_room.top_scorer);
		} else {
			for (var i = 0; i < unique_room.player_lst.length; i++) {
				var player = unique_room.player_lst[i]; 

				var top_player = {
					id: player.id, 
					username: player.username,
					score: player.score
				}
				
				unique_room.top_scorer[i] = top_player;
			}
			
			io.sockets.in(room).emit("leader_board", unique_room.top_scorer);
		}
		

	}
	
	physics_hanlder();
}

function physics_hanlder() {
		
	// update physcis 
	
	
	
	var currentTime = (new Date).getTime();
	timeElapsed = currentTime - startTime;
	//console.log(timeElapsed);
	var dt = lastTime ? (timeElapsed - lastTime) / 1000 : 0;
    dt = Math.min(1 / 10, dt);
    // Move physics bodies forward in time
    world.step(timeStep);


}



function addfood(n, room) {
	var new_food = []; 
	
	if (n <= 0) {
		return; 
	}
	
	for (var i = 0; i < n; i++) {
		var unique_id = unique.v4(); 
		var foodentity = new food(room.canvas_width, room.canvas_height, 'food', unique_id);
		room.food_pickup.push(foodentity); 
		new_food.push(foodentity); 
		io.sockets.in(room.room_id).emit("item_update", foodentity); 
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
	
	this.player_stunned = function () {
		//make sure this is called only once
		console.log("stunned");
		this.attacking = false; 
		this.playerBody.velocity[0] = this.lastAttackSpeedX * -1/10; 
		this.playerBody.velocity[1] = this.lastAttackSpeedY * -1/10; 
		
	}
	
}

// call this function when new player enters the game 
function onNewplayer (data) {
	var newPlayer = new Player(data.x, data.y, data.angle);
	playerBody = new p2.Body ({
		mass: 0,
		position: [0,0],
		fixedRotation: true
	});
	
	//set the specific id, username, and room id 
	newPlayer.id = this.id;	
	newPlayer.username = data.username;
	newPlayer.room_id = data.room_id; 
	newPlayer.body_color = data.body_color; 
	newPlayer.sword_color = data.sword_color; 
	newPlayer.shield_color = data.shield_color;
	newPlayer.maxscreensize = data.maxscreensize;
	newPlayer.sword_height = 0.2;
	newPlayer.level = 1;
	newPlayer.speed = 300; 
	// this is for picking up speed pickups.
	newPlayer.speedpickupque = 0; 
	newPlayer.playerBody = playerBody;
	newPlayer.sendData = true;
	
	
	// related to attacks. 
	newPlayer.dashspeed = 1000;
	newPlayer.attacking = false;
	newPlayer.canattack = true;
	
	newPlayer.stunned = false;
	// this is for picking up stun pickups.
	newPlayer.stunpickupque = 0;
	
	newPlayer.player_value = 100;
	newPlayer.expvalue = 0; 
	newPlayer.exp_max = 100;
	
	
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
		angle: newPlayer.angle,
		body_color: newPlayer.body_color,
		sword_color: newPlayer.sword_color,
		shield_color: newPlayer.shield_color
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
			body_color: existingPlayer.body_color,
			sword_color: existingPlayer.sword_color,
			shield_color: existingPlayer.shield_color			
		};
		this.emit('new_player', player_info);
	}
	
	for (j = 0; j < room.food_pickup.length; j++) {
		var food_pick = room.food_pickup[j];
		this.emit('item_update', food_pick); 
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
		var top_player = {
			id: newPlayer.id,
			username: newPlayer.username
		}
		
		room.top_scorer.push(top_player); 
	}

	room.player_lst.push(newPlayer); 
	
		
	world.addBody(newPlayer.playerBody);
}

function onPlayerAttack (data) {
	// find the attacking player and the attacked player 
	var attacking = find_playerid(data.player_id, this.room); 
	var attacked = find_playerid(data.enemy_id, this.room); 
	//add the logic for making sure the enemy's position is near the poistion of attacked player 
	
	if (attacking.stunned) {
		return;
	}
	
	console.log("damaged");
	// if the attacking player is already dead, or the attacked player is already dead  exit 
	if (attacking.dead || attacked.dead) {
		return; 
	}
	this.broadcast.to(data.enemy_id).emit('damaged', {id: data.enemy_id, by_id: data.player_id, pierce: pierce}); 
}

function onDamaged (data) {
 
}

function onKilled (data) {
	var room = this.room;
	var room_id = this.room_id;
	
	var removePlayer = find_playerid(this.id, room);
	removePlayer.dead = true; 
	//get rid of players in player list and top_score lists
	var top_player = find_topscorer(this.id, room); 
	
	if (removePlayer) {
		room.player_lst.splice(room.player_lst.indexOf(removePlayer), 1);
		room.player_num--;
		avail_roomlist.push(this.room_id); 
	}
	if (top_player) {
		room.top_scorer.splice(room.top_scorer.indexOf(top_player), 1);
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



function onlevelup (data) {
	var movePlayer = find_playerid(this.id, this.room); 
	var room = this.room;
	var max = movePlayer.maxscreensize; 
	var percent = 100/max;
	
	
	movePlayer.expvalue = 0;
	movePlayer.speed += 200;
	movePlayer.dashspeed += 200; 
	movePlayer.player_value *= 1.3; 
	movePlayer.exp_max *= 1.5; 
	
	movePlayer.sword_height += percent;
	movePlayer.level += 1;
	
	
	if (!movePlayer) {
		return;
		console.log('no player'); 
	}
	
	var moveplayerData = {
		id: movePlayer.id,
		swordchange: true,
		sword_height: movePlayer.sword_height
	}
	
	var levelupData = {
		sword_height: movePlayer.sword_height,
		level: movePlayer.level,
		speed: movePlayer.speed, 
		dashspeed: movePlayer.dashspeed
	}
	
	this.emit('level_up', levelupData); 
	this.broadcast.to(this.room_id).emit('enemy_levelup', moveplayerData); 
}


function onfoodpicked (player,value) { 
	var movePlayer = find_playerid(this.id, this.room); 

	
	var new_exp = movePlayer.expvalue + value; 
	movePlayer.expvalue = new_exp;
	var exp_max = movePlayer.exp_max; 
		
	this.emit("exp_gain", {exp: value}); 
	
	
	while (movePlayer.expvalue >= movePlayer.exp_max) {
		movePlayer.expvalue = movePlayer.expvalue - movePlayer.exp_max;
		var levelup = onlevelup.bind(this);
		levelup(); 
	}
	
}


function onitemPicked (data) {
	//the room that the item is in;
	var room = this.room; 
	var movePlayer = find_playerid(this.id, this.room); 
	
	var speedpickup = false; 
	var piercepickup = false;
	var stunpickup = false; 
	
	console.log(data.id);
	if (data.type === 'speed') {
		
		if (movePlayer.speedpickupque === 0) {
			movePlayer.prevspeed = movePlayer.speed;
		}
		movePlayer.speedpickupque += 1; 
		
		//movePlayer.speed = 1000;
		
		setTimeout(function(){
		if (movePlayer.speedpickupque === 1) {
			movePlayer.speedpickupque -= 1; 
			movePlayer.speed = movePlayer.prevspeed;
			movePlayer.speedboost = false;
		} else {
			movePlayer.speedpickupque -= 1; 
			
			
		}}, 3000); 
		
		var object = find_item(data.id, room.speed_pickup.length, room.speed_pickup); 
		room.speed_pickup.splice(room.speed_pickup.indexOf(object), 1);
		movePlayer.speedboost = true; 
		
	} else if (data.type === 'stun') {
		movePlayer.stunpickupque += 1; 
		
		setTimeout(function(){
		if (movePlayer.stunpickupque === 1) {
			movePlayer.stunpickupque -= 1; 
			movePlayer.stunimmune = false;
		} else {
			movePlayer.stunpickupque -= 1; 
			
			
		}}, 3000); 
		
		var object = find_item(data.id, room.stun_pickup.length, room.stun_pickup); 
		room.stun_pickup.splice(room.stun_pickup.indexOf(object), 1);
		//movePlayer.stunimmune = true;
		
	} else if (data.type === 'pierce') {
		var object = find_item(data.id, room.pierce_pickup.length, room.pierce_pickup); 
		room.pierce_pickup.splice(room.pierce_pickup.indexOf(object), 1);
		movePlayer.pierce = true; 
		
	} else if (data.type === 'food') {
		var object = find_item(data.id, room.food_pickup.length, room.food_pickup); 
		room.food_pickup.splice(room.food_pickup.indexOf(object), 1);
		console.log("food picked");
		var foodbind = onfoodpicked.bind(this);
		foodbind(movePlayer, 50);
	}
	
	
	if (object === false) {
		console.log('cannot be found' + object.id);
	} 
	
	
	var itemData = {
		item_type: data.type
	}
	
	var moveplayerData = {
		id: movePlayer.id,
		speedboost: speedpickup,
		piercepickup: movePlayer.pierce, 
		stunimmune: movePlayer.stunimmune,
		sword_height: movePlayer.sword_height
	}
	
	io.sockets.in(this.room_id).emit('itemremove', object); 
	this.emit('item_picked', itemData);
	this.broadcast.to(this.room_id).emit('enemy_itempicked', moveplayerData);
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
	
	
	//intialize the food list with random foods on room creation 
	for (var i = 0; i < new_game.food_pickupnum; i++) {
		var unique_id = unique.v4(); 
		var foodentity = new food(new_game.canvas_width, new_game.canvas_height, 'food', unique_id);
		new_game.food_pickup.push(foodentity); 
	}
	//intialize the items such as speed, pierce, and stun pickup lists on room creation 
	for (var i = 0; i < new_game.speed_pickupnum; i++) {
		var unique_id = unique.v4(); 
		var speedentity = new speed(new_game.canvas_width, new_game.canvas_height, 'speed', unique_id);
		new_game.speed_pickup.push(speedentity); 
	}
	
	for (var i = 0; i < new_game.stun_pickupnum; i++) {
		var unique_id = unique.v4(); 
		var stunentity = new stun(new_game.canvas_width, new_game.canvas_height, 'stun', unique_id);
		new_game.stun_pickup.push(stunentity); 
	}
	
	for (var i = 0; i < new_game.pierce_pickupnum; i++) {
		var unique_id = unique.v4(); 
		var pierceentity = new stun(new_game.canvas_width, new_game.canvas_height, 'pierce', unique_id);
		new_game.pierce_pickup.push(pierceentity);   
	}
	
	room_List[new_roomid] = new_game; 
	
	avail_roomlist.push(new_roomid);
}

function is_inrange (number1, number2, tolerance) {
	if (Math.abs(number1 - number2) <= tolerance) {
		return true; 
	}
}

function onInputFired (data) {
	// the player that this socket is connected to
	
	
	var movePlayer = find_playerid(this.id, this.room); 
	
		
	if (!movePlayer) {
		return;
		console.log('no player'); 
	}
	
	
	if (!movePlayer.sendData) {
		return;
	}
	
	if (movePlayer.stunned) {
		movePlayer.playerBody.angle = movePlayer.lastAttackAngle;
	}
	
	movePlayer.sendData = false;
	setTimeout(function() {movePlayer.sendData = true}, 50);
	
	if (movePlayer.attacking) {
		if (is_inrange(movePlayer.attackDestX, movePlayer.playerBody.position[0], 50) && 
			is_inrange(movePlayer.attackDestY, movePlayer.playerBody.position[1], 50)) {
			movePlayer.attacking = false;
			movePlayer.pierce = false;
			this.broadcast.to(this.room_id).emit('enemy_attackstop',{id:  movePlayer.id});
		}
		movePlayer.playerBody.angle = movePlayer.lastAttackAngle;
	} else {
			
		if (!movePlayer.stunned) {
			var angle; 
			// the pointer that the server will contain. the server game size is 4000 by 4000, so multiply by 4000
			var serverPointer = {
				x: data.pointer_x * 4000, 
				y: data.pointer_y * 4000, 
				worldX: data.pointer_worldx * 4000, 		
				worldY: data.pointer_worldy * 4000
			}
			
			if (physicsPlayer.distanceToPointer(movePlayer, serverPointer) <= 30) {
				movePlayer.playerBody.angle = physicsPlayer.movetoPointer(movePlayer, 0, serverPointer, 1000);
			} else {
				movePlayer.playerBody.angle = physicsPlayer.movetoPointer(movePlayer, movePlayer.speed, serverPointer);	
			}
		}
		
	}
	
		
	var info = {
		x: movePlayer.playerBody.position[0]/4000,
		y: movePlayer.playerBody.position[1]/4000,
		angle: movePlayer.playerBody.angle,
		stunned: movePlayer.stunned,
		attacking: movePlayer.attacking,
		pierce: movePlayer.pierce
	}

		
	this.emit('input_recieved', info);
		
	var room = this.room;

		
	//check if the moving player is in first place
	if (room.top_scorer[0].id === movePlayer.id) {
		movePlayer.first_place = true; 
	} else {
		movePlayer.first_place = false; 
	}


		
	var moveplayerData = {
		id: movePlayer.id, 
		attacking: movePlayer.attacking,
		stunned: movePlayer.stunned,
		stunimmune: movePlayer.stunimmune,
		pierce: movePlayer.pierce,
		first_place: movePlayer.first_place,
		sword_height: movePlayer.sword_height,
		x: movePlayer.playerBody.position[0]/4000,
		y: movePlayer.playerBody.position[1]/4000,
		angle: movePlayer.playerBody.angle,
		attacking: movePlayer.attacking
	}
		
	this.broadcast.to(this.room_id).emit('move_player', moveplayerData);
	
	
}

//the mouse button click of the player
function onattackInputFired (data) {
	var movePlayer = find_playerid(this.id, this.room);	
	
	if (movePlayer.canattack && !movePlayer.stunned) {
		movePlayer.canattack = false; 
		movePlayer.attacking = true;
		setTimeout(function(){movePlayer.canattack = true;}, 1000); 
		
		var pointer = {
			x: data.x, 
			y: data.y, 
			worldX: data.worldX,		
			worldY: data.worldY
		}
		
		//player attack; move to the pointer position
		physicsPlayer.movetoPointer(movePlayer, 1000, pointer); 
		movePlayer.attackDestX = pointer.worldX * 4000; 
		movePlayer.attackDestY = pointer.worldY * 4000;
	
		
		
		var data = {
			pointer: pointer,
			dashspeed: movePlayer.dashspeed,
		}

		
		var serverPointer = {
			x: pointer.x * 4000, 
			y: pointer.y * 4000, 
			worldX: pointer.worldX * 4000, 		
			worldY: pointer.worldY * 4000
		}
		
		
		movePlayer.playerBody.angle = physicsPlayer.movetoPointer(movePlayer, movePlayer.dashspeed, serverPointer);	
		movePlayer.lastAttackSpeedX = movePlayer.playerBody.velocity[0];
		movePlayer.lastAttackSpeedY = movePlayer.playerBody.velocity[1];
		movePlayer.lastAttackAngle = movePlayer.playerBody.angle; 
		
		this.emit('attackinput_recieved', data); 
		
		
		var data = {
			id: movePlayer.id, 
			remotePointer: pointer,
			attacking: movePlayer.attacking,
			pierce: movePlayer.pierce,
			first_place: movePlayer.first_place,
			speed: movePlayer.speed,
			dashspeed: movePlayer.dashspeed
		}

		
		this.broadcast.to(this.room_id).emit('enemy_attack', data);
	} else {
		return; 
	}
}


function onStunned (data) {
	
	// the stunned player 
	var stunnedPlayer = find_playerid(data.player_id, this.room); 
	// the player that stunned 
	var enemyPlayer = find_playerid(data.enemy_id, this.room);
	
	if (stunnedPlayer.stunimmune) {
		this.emit('stunned_immune'); 

	} else {
		// frees stun after 3 seconds
		stunnedPlayer.stunned = true;
		setTimeout(function(){stunnedPlayer.stunned = false}, 3000); 
		//this.emit('stunned', {id: enemyPlayer.id, username: enemyPlayer.username}); 
	}
	
	stunnedPlayer.player_stunned();
	
	var data = {
		id: stunnedPlayer.id, 
		attacking: stunnedPlayer.attacking,
		pierce: stunnedPlayer.pierce,
		stunned: stunnedPlayer.stunned,
		first_place: stunnedPlayer.first_place,
		speed: stunnedPlayer.speed,
		dashspeed: stunnedPlayer.dashspeed
	}
	
	if (stunnedPlayer.stunimmune) {
		this.broadcast.to(this.room_id).emit('enemy_stunnedimmune', data);
		console.log("enemy stun immune");
	} else {
		this.broadcast.to(this.room_id).emit('enemy_stunned', {id: data.id});
	}
}


function find_maxPlayer() {
	return 10;
}


io.sockets.on('connection', function(socket){
	
	socket.on('enter_name', onEntername); 
	
	socket.on('logged_in', onLoggedin); 
	//listen for the input of the connected client
	socket.on('input_fired', onInputFired); 
	
	//listen for the attack input from the client 
	socket.on('attack_inputfired', onattackInputFired); 
	
	
	// listen if there is a new player; 
	socket.on('new_player', onNewplayer);

	
	// listen for disconnection; 
	socket.on('disconnect', onClientdisconnect); 
	
	//listen if the player is stunned 
	socket.on('player_stunned', onStunned); 
	
	// listen for attacks
	socket.on('player_attack', onPlayerAttack); 
	
	// listen for player levelup
	socket.on('level_up', onlevelup); 
	
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