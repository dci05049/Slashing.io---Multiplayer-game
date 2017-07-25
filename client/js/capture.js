game_config = {
}

var gamegraphicsassets = {
	tile_url: "client/assets/sprites/background.jpeg",
	tile_name: "tile",
	
	arrow_url: 'client/assets/sprites/arrow.png',
	arrow_name: 'arrow',
	
	sword_url: 'client/assets/sprites/sword.png',
	sword_name: 'sword', 
	
	sword_pierceurl: 'client/assets/sprites/sword_pierce.png',
	sword_piercename: 'sword_pierce',
	
	shield_url: 'client/assets/sprites/shield.png',
	shield_name: 'shield',
	
	scorebord_url: 'client/assets/sprites/scoreboard.png',
	scoreboard_name: 'scoreboard',
	
	speedpickup_url: 'client/assets/sprites/speedpickup.png', 
	speedpickup_name: 'speedpickup',
	
	stunpickup_url: 'client/assets/sprites/stun_pickup.png', 
	stunpickup_name: 'stunpickup',
	
	piercepickup_url: 'client/assets/sprites/pierce_pickup.png', 
	piercepickup_name: 'piercepickup',
	
	crown_url: 'client/assets/sprites/crown.png', 
	crown_name: 'crown',
	
	blood_url: 'client/assets/sprites/blood.png', 
	blood_name: 'blood'
	
	
};

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}


var enemies = []; 
var speed_pickup = []; 
var stun_pickup = [];
var pierce_pickup = [];
var food_pickup = [];
var food_color = [];

//gameobjects that can be rescaled; 
var scale_sprites = []; 
//gameobjects that has to be destroyed and recreated; 
var recreate_objects = [];



food_color = randomColor({
   count: 10,
   hue: 'green'
});

//color configuration 
var color_base = ['red', 'blue', 'green']; 
 
 
var mainState = function(game){
	
};

function dash_attack (data) {
	var dashspeed = data.dashspeed;
	
	var pointer = {
		x: data.pointer.x * gameProperties.screenWidth,
		y: data.pointer.y * gameProperties.screenHeight, 
		worldX: data.pointer.worldX * gameProperties.gameWidth,
		worldY: data.pointer.worldY * gameProperties.gameHeight, 
	}

	if (!player_properties.killed && player_properties.canattack) {
		if (player_properties.in_cols_shield.length >= 1 && !player_properties.pierce) {
			var enemy_id = player_properties.in_cols_shield[0]; 
			socket.emit('player_stunned', {player_id: socket.id, enemy_id: enemy_id});
		}
			
			if (player_properties.canattack == true) {
				player_properties.next_attack = player_properties.attack_cooldown + gameProperties.current_time; 
				player_properties.player_attack = true; 
			}
			
			//the last move position for the player
			player_properties.player_moveX = pointer.worldX;
			player_properties.player_moveY = pointer.worldY;
			
			
			
			// make sure the player items follow players * this line is for when the player first loads and spams click 
			player_properties.player_update();	

			
			for (var i = 0; i < player_properties.in_cols.length; i++) {
				console.log(player_properties.in_cols);
				if (!player_properties.stunned && player_properties.player_attack && player_properties.in_cols_shield < 1) {
					//emit message of the position of the player 
					socket.emit('player_attack', {player_id: socket.id, enemy_id: player_properties.in_cols[i]});
				}
			}

		
	}

}

function onlevelUp (data) {
	player_properties.level = data.level;
	console.log(player_properties.level);
	var availMax = gameProperties.availMax;
	
	player_properties.sword_height = data.sword_height * availMax; 
	player_properties.destroy_sword(); 
	player_properties.draw_sword(player_properties.sword_width, player_properties.sword_height, player_properties.pierce);
		
		
	player_properties.dashspeed = data.dashspeed; 
	player_properties.speed = data.speed; 
		
	if (player_properties.speed <= 700) {
		player_properties.speed = data.speed; 
	}
		
		
	var level_lst = [];
		
	//push the text that needs to be displayed in the level_lst;
	level_lst.push('Sword Length Increases');
	level_lst.push('Movement Speed UP'); 
	level_lst.push('Dash Speed UP'); 
	level_lst.push('Player Level UP'); 
	var length = level_lst.length; 
		
	for (var i = 0; i < length; i++) {
		player_properties.display_onPlayer(level_lst[i], 200); 
	}
}

function onexpGain (data) {
	var expvalue = data.exp; 
	player_properties.onPlusClick(expvalue);
}



function sendAttackInput () {
	player_properties.attacking = true;
	var pointer = {
		x: game.input.mousePointer.x / gameProperties.screenWidth,
		y: game.input.mousePointer.y / gameProperties.screenHeight, 
		worldX: game.input.mousePointer.worldX / gameProperties.gameWidth,
		worldY: game.input.mousePointer.worldY / gameProperties.gameHeight, 
	}
	socket.emit('attack_inputfired', pointer);  
}


function onenemystunnedImmune (data) {
	var movePlayer = findplayerbyid (data.id); 
	if (!movePlayer) {
		console.log('couldnt find player', data.id); 
		return
	}
	
	console.log("enemy stun immune");
	movePlayer.player.body.velocity.x = 0;
	movePlayer.player.body.velocity.y = 0;
	movePlayer.updateremote();
	
	movePlayer.attacking = false; 
}

function onenemyStunned (data) {
	var movePlayer = findplayerbyid (data.id); 
	if (!movePlayer) {
		console.log('couldnt find player', data.id); 
		return
	}
	
	movePlayer.player_stunned();
	movePlayer.updateremote();
	movePlayer.attacking = false;
	console.log("enemy stunned");
	return;
}

function onremotestatuschanged (data) {
		var movePlayer = findplayerbyid (data.id); 
		
				
		if (!movePlayer) {
			console.log('couldnt find player', data.id); 
			return
		}
		
		
		//check the difference in sword size, if it is, redraw 
		var ori_swordheight = movePlayer.sword_height/gameProperties.availMax;
	
		
		if (movePlayer.dead) {
			movePlayer.attacking = false;
			movePlayer.stunned = false;
			return;
		}
		
		if (data.stunned) {
			return;
		}
		
		if (data.swordchange) {
			console.log('sword size changed');
			movePlayer.destroy_sword(); 
			movePlayer.sword_height = data.sword_height * gameProperties.availMax;
			movePlayer.draw_sword(movePlayer.sword_width, movePlayer.sword_height); 
		}
		
				
		if (data.pierce) {
			console.log('enemy has pierce');
			if (!movePlayer.pierce) {
				movePlayer.destroy_sword(); 
				movePlayer.pierce_effect(); 
			}
			movePlayer.pierce = true;
		} else {
			if (movePlayer.pierce) {
				movePlayer.destroy_sword(); 
				movePlayer.draw_sword(movePlayer.sword_width, movePlayer.sword_height); 
			}
			movePlayer.pierce = false; 
		}
	
}

function onremoteAttack (data) {
	console.log("enemy attack");
	var movePlayer = findplayerbyid (data.id); 		
	if (!movePlayer) {
		console.log('couldnt find player', data.id); 
		return
	}
	
	var dashspeed = data.dashspeed;
			
	var newPointer = {
		x: data.remotePointer.x * gameProperties.screenWidth,
		y: data.remotePointer.y * gameProperties.screenHeight, 
		worldX: data.remotePointer.worldX * gameProperties.gameWidth,
		worldY: data.remotePointer.worldY * gameProperties.gameHeight, 
	}

	
	//check if the enemy attacked 
	if (data.attacking) { 
			
		movePlayer.attacking = true; 
		movePlayer.player_moveX = newPointer.worldX;
		movePlayer.player_moveY = newPointer.worldY;	
		movePlayer.enemy_attack(movePlayer);
		// move the player towards the location 
		//movePlayer.updateremote(newPointer, dashspeed * scale_ratio);				
	}
}

function onremoteattackstop(data){
	var movePlayer = findplayerbyid (data.id); 
		
				
	if (!movePlayer) {
		console.log('couldnt find player', data.id); 
		return
	}
	
	console.log("attack false");
	movePlayer.attacking = false; 
}


// find the player in the enimes list of the id passed and change its position in the game 
function onMoveplayer (data) {
	
	if (gameProperties.in_game) {
		
		var movePlayer = findplayerbyid (data.id); 
		
				
		if (!movePlayer) {
			console.log('couldnt find player', data.id); 
			return
		}
		
		
		//check the difference in sword size, if it is, redraw 
		var ori_swordheight = movePlayer.sword_height/gameProperties.availMax;
	
		
		if (movePlayer.dead) {
			movePlayer.attacking = false;
			movePlayer.stunned = false;
			return;
		}
		
	
		var newPointer = {
			x: data.x,
			y: data.y, 
			worldX: data.x * gameProperties.gameWidth,
			worldY: data.y * gameProperties.gameWidth, 
		}	
		

		var speed = data.speed; 
		
		
		
		
	
		var distance = distanceToPointer(movePlayer.player, newPointer); 
	
		var speed = distance/0.05;
	

		var angle = movetoPointer(movePlayer.player, speed, newPointer);
		movePlayer.player.rotation = data.angle;
		movePlayer.updateremote();
	}
}


function onitemUpdate (data) {
	var type = data.type;
	switch (type) {
		
		case "speed": {
			speed_pickup.push(new speed_object(data.id, game, type, data.x, data.y)); 
			break;
		}
		case "stun": {
			stun_pickup.push(new stun_object(data.id, game, type, data.x, data.y));
			break;
		}
		case "pierce": {
			pierce_pickup.push(new pierce_object(data.id, game, type, data.x, data.y));
			break;
		}
		
		case "food": {
			food_pickup.push(new food_object(data.id, game, type, data.x, data.y)); 
			break;
		}
	}
	 
}

function onitemPicked (data) {
	var item_type = data.item_type; 
	
	this.boost_turnoff = function () {
		player_properties.speed_boost = false; 
	}
	
	this.stun_immuneturnoff = function () {
		player_properties.stun_immune = false; 
	}
	
	if (item_type === 'speed') {
		if (player_properties.speed <= 600) {
			console.log('speed pickup');
			var prev_speed = player_properties.speed; 
			player_properties.speed_pickup(); 
			
			game.time.events.add(Phaser.Timer.SECOND * 4, function () {player_properties.speed_boost = false
			player_properties.speed = prev_speed} , this);
		}
	
	} else if (item_type === 'stun') {
		player_properties.stun_immunepickup();
		
		game.time.events.add(Phaser.Timer.SECOND * 4, this.stun_immuneturnoff, this); 
	} else if (item_type === 'pierce') {
		player_properties.pierce_inattack = true; 
		player_properties.pierce_pickup(); 

	} else if (item_type === 'food') {
		return; 
	}	
}

// call this function when first connected 
function onSocketConnected () {
	var username = game_config.username;
	var socketid = game_config.socketid; 
	var room_id = game_config.room_id; 
	var body_color = game_config.body_color; 
	var sword_color = game_config.sword_color; 
	var shield_color = game_config.shield_color;
	
	socket.emit('new_player', {username: username, id: socketid, room_id: room_id, maxscreensize: gameProperties.availMax, x: 0,
	y: 0, angle:player.angle, body_color: body_color, sword_color: sword_color, shield_color: shield_color});
}

function onSocketDisconnect () {
	console.log('Disconnected from socket server')
}


function onDamaged (data) {
	
	console.log("damaged");

	player_properties.player_health -= 10; 
	// when the player dies, kill him
	if (player_properties.player_health <= 0) {
		if (!player_properties.killed) {
			if (data.pierce) {
				player_properties.display_text('Enemy had Pierce'); 
			}
			player_properties.display_text('Killed by' + data.by_id, 1000); 
			player_properties.player_killed();
			add_blood(player.x, player.y);
			
			socket.emit('killed', {id: socket.id, by_id:data.by_id, pierce: data.pierce}); 
		}
	}
}


function onStunned (data) {
	if (player_properties.stun_immune) {
		player_properties.display_text('Stun Immune'); 
		player_properties.display_onPlayer('Stun Immune'); 
		player_properties.player_attack = false; 
		return; 
	}
	

	player_properties.player_stunned(); 
	player_properties.display_text('Stunned By ' + data.username, player_properties.stunned_time * 1000/2); 
	player_properties.display_onPlayer('Stunned !', player_properties.stunned_time * 1000/2); 
}

function onstunnedImmune (data) {
	console.log("stun immune");
	player.body.velocity.x = 0;
	player.body.velocity.y = 0;
	player_properties.player_update();
	player_properties.player_attack = false; 

}

function onGained (data) {
	
	var value = data.value; 
	if (data.pierce) {
		player_properties.display_text('Slayed Enemy With Pierce!'); 
		value *= 1.5; 
	}

	var username = data.username; 
	
	player_properties.onPlusClick(value);
	player_properties.player_score += value; 
	player_properties.display_text("You Killed " + username);
	
	//add kill streak
	player_properties.killstreak += 1; 
	
	// if the player killed a player in duration, add to streak; 	
	if (player_properties.streak_end >= gameProperties.current_time) {
		player_properties.display_text(player_properties.killstreak + " Kill Streak"); 
	} else if (player_properties.killstreak >= 2) {
		player_properties.killstreak = 0;
	}
	
	player_properties.streak_end = player_properties.streak_duration + gameProperties.current_time; 	
	
	
	// get rid of the in_cols list of the slain enemy id; 
	for (var i = 0; i < player_properties.in_cols.length; i++) {
		
		if (player_properties.in_cols[i] === data.id) {
			player_properties.in_cols.splice(i, 1);
		}
	}
	// get rid of the in_cols_shield if the player was in collision
	for (var i = 0; i <player_properties.in_cols_shield.length; i++) {
		if (player_properties.in_cols_shield[i] === data.id) {
			player_properties.in_cols_shield.splice(i, 1);
		}
	}
	
	
	socket.emit('gained', {value: value, player_score: player_properties.player_score});
}


function is_inrange (number1, number2, tolerance) {
	if (Math.abs(number1 - number2) <= tolerance) {
		return true; 
	}
}

function onitemremove (data) {
	
	var removeItem; 
	switch (data.type) {
		case 'speed':
			removeItem = finditembyid(data.id, speed_pickup.length, speed_pickup);
			speed_pickup.splice(speed_pickup.indexOf(removeItem), 1);
			break;
		case 'stun':
			removeItem = finditembyid(data.id, stun_pickup.length, stun_pickup );
			stun_pickup.splice(stun_pickup.indexOf(removeItem), 1);
			break; 
		case 'pierce':
			removeItem = finditembyid(data.id, pierce_pickup.length, pierce_pickup );
			pierce_pickup.splice(pierce_pickup.indexOf(removeItem), 1);
			break; 
		case 'food': 
			removeItem = finditembyid(data.id, food_pickup.length, food_pickup );
			food_pickup.splice(food_pickup.indexOf(removeItem), 1); 
			break;
	}

	if (!removeItem) {
		console.log(data.id);
		console.log("could not find item");
	}

	removeItem.item.destroy(true,false);
	
}


function game_reset () {	
	game.stage.disableVisibilityChange = true;
	game.world.setBounds(0, 0, gameProperties.gameWidth, gameProperties.gameHeight, false, false, false, false);
	game.physics.startSystem(Phaser.Physics.P2JS);
	game.physics.p2.setBoundsToWorld(false, false, false, false, false)
	game.physics.p2.gravity.y = 0;
	game.physics.p2.applyGravity = false; 
	game.physics.p2.enableBody(game.physics.p2.walls, false); 
	// physics start system
	game.physics.p2.setImpactEvents(true);
	//setting up tiles 
	var tile_set = game.add.tileSprite(0,0,4000,4000,'tile');
	tile_set.scale.set(scale_ratio); 	
	scale_sprites.push(tile_set);
	
	// empty the enemies, items 
	enemies = [];
	speed_pickup = []; 
	stun_pickup = [];
	pierce_pickup = [];
	food_pickup = [];
}


function onKilled () {
	game.time.events.add(Phaser.Timer.SECOND * 4, function () {gameProperties.in_game = false; 
	game.state.start('login', slideOut, slideIn, true, true);
	//disconnect the socket on death 
	game.world.removeAll(); socket.disconnect(); } , this); 
}


function add_blood (x,y) {
	var blood = game.add.sprite(x - 50, y - 50, 'blood');
	blood.anchor.setTo(0.5,0.5);
	blood.scale.setTo(3,3);
	var blood_anim = blood.animations.add('splat');
	blood.animations.play('splat', 20, false);
	blood_anim.onComplete.add(function () {blood.destroy(true,false)} , this);
}

function onInputRecieved (data) {
	
	/*
	if (data.stunned) {
		console.log("stunned");
		return;
	}
	*/
		
	if (data.attacking) {
		player_properties.player_attack = true;
	} else {
		player_properties.player_attack = false;
	}
		
	var newPointer = {
		x: data.x,
		y: data.y, 
		worldX: data.x * gameProperties.gameWidth,
		worldY: data.y * gameProperties.gameWidth, 
	}

	
	if (!player.prevX) {
		player.prevX = player.x; 
		player.prevY = player.y;
	}
	
	var distance = distanceToPointer(player, newPointer); 
	
	var speed = distance/0.05;
	
	
	if (data.stunned) {
		player.rotation = data.angle;
		 movetoPointer(player, speed, newPointer);
		console.log("stunned");
	} else  {
		player.rotation = movetoPointer(player, speed, newPointer);
	}
	
	console.log(data.pierce);
	if (!data.pierce && player_properties.pierce) {
		player_properties.pierce = false;
		player_properties.destroy_sword(); 
		player_properties.draw_sword(player_properties.sword_width, player_properties.sword_height);
	}
	
	
	
	/*
	// character movement 
	if (!player_properties.player_attack) {
		if (distanceToPointer(player, newPointer) <= 30) {
			angle = movetoPointer(player, 0, newPointer, 1000);
			player.rotation = angle; 
		} else {
			angle = movetoPointer(player, speed * scale_ratio , newPointer);
			player.rotation = angle; 
		}
	}
	*/

}


 

mainState.prototype = {
	
    preload: function () {
		//physics


    },
 
    create: function () {
		//resetting the game 
		game_reset();


		if (gameProperties.in_game) {
			
			////related to players/////
			
			// when the socket connects, call the onsocketconnected and send its information to the server 
			socket.emit('logged_in'); 
			
			// when the player enters the game 
			socket.on('enter_game', onSocketConnected); 
			
			//this is for moving the player when they send inputs to the server 
			socket.on('input_recieved', onInputRecieved); 
			
			//this is for receiving attack inputs from the server 
			//socket.on('attackinput_recieved', dash_attack); 
			
			// when received remove_player, remove the player passed; 
			socket.on('remove_player', onRemovePlayer); 
			
			// check for item update
			socket.on('item_update', onitemUpdate); 
			
			// check for itempicked
			socket.on('item_picked', onitemPicked); 
			
			// check if damaged 
			socket.on('damaged', onDamaged); 
			
			// check if stunned 
			socket.on('stunned', onStunned);

			// check if player stunned the enemies
			socket.on('stunned_immune', onstunnedImmune);
			
			// check to gain points 
			socket.on ('gained_point', onGained.bind(this)); 
			
			// check for leaderboard
			socket.on ('leader_board', lbupdate); 
			
			// check for item removal
			socket.on ('itemremove', onitemremove); 
			
			// check for restart game 
			socket.on ('killed', onKilled); 
			
			// check for exp gain 
			socket.on ('exp_gain', onexpGain); 
			
			// check for levelup
			socket.on ('level_up', onlevelUp); 
			
			
			//// related to remote players ////
			
			socket.on('enemy_stunnedimmune', onenemystunnedImmune); 
			
			socket.on('enemy_stunned', onenemyStunned); 
			
			socket.on('enemy_attackstop', onremoteattackstop);
			
			socket.on('enemy_attack', onremoteAttack); 
			
			// listen if other players move 
			socket.on('move_player', onMoveplayer); 
			
			//when enemy picks up item 
			socket.on('enemy_itempicked', onremotestatuschanged);
			
			//check when enemy levels up
			socket.on('enemy_levelup', onremotestatuschanged);
			
			
			
			 //listen for the broadcast.emit from the server for new player; 
			socket.on('new_player', function(info) {
				var check_duplicate = findplayerbyid(info.id);
				if (!check_duplicate) {
					var newPlayer = new remote_player(info.id, info.username, game, player, info.x, info.y,
					info.angle, info.body_color, info.sword_color, info.shield_color);
					enemies.push(newPlayer); 
				} else {
					return; 
				}
			
			}); 
			
		
		}
		

		player_properties = new set_player();
		player_properties.player_id = socket.id;		
		player = game.add.graphics(0, 0);
		player.scale.set(scale_ratio);
		player.name = player_properties.player_id; 
		player.radius = gameProperties.availMax * 0.08; 

		// set a fill and line style
		player.beginFill(game_config.body_color);
		player.lineStyle(2, 0xffd900, 1);
		player.drawCircle(0, 0, player.radius * 2);
		player.endFill();
		player.anchor.setTo(0.5,0.5);

			
		// draw a shape
		game.physics.p2.enableBody(player, true);
		player.body_type = "circle";
		player.type = "body"; 
		player.body.clearShapes();
		player.body_size = player.radius; 
		player.body_offsetX = 0;
		player.body_offsetY = 0;
		
		player.body.addCircle(player.body_size * scale_ratio, 0 , 0); 
		player.body.data.shapes[0].sensor = true;
		player.body.onBeginContact.add(player_coll, this); 
		player_properties.all_sprites.push(player); 
	
		
		//create sword 
		player_properties.draw_sword(player_properties.sword_width, player_properties.sword_height); 
		player_properties.draw_shield();
		
		
		//player_properties.draw_handle();

		gui_interface(); 
		
		//keycode; 
		attack_key = game.input.keyboard.addKey(Phaser.Keyboard.A);
		
		player_properties.player_update();
		game.input.onDown.add(sendAttackInput, this);
		
		//camera follow
		game.camera.follow(player, Phaser.Camera.FOLLOW_LOCKON, 0.5, 0.5);
		
    },
 
    update: function () {

		game.world.bringToTop(score_board);

		if (gameProperties.in_game) {
			
			//set the currenttime in game propeties; 
			gameProperties.current_time = game.time.totalElapsedSeconds(); 

			
			//setting the gui element texts
			if (game_config.username) {
				playertext.setText(game_config.username); 
				player_level.setText("Level: " + player_properties.level);
			}
			
			/*
			if (player_properties.next_attack < gameProperties.current_time) {
				player_properties.canattack = true; 
			} else {
				player_properties.canattack = false;
			}
			*/
			
			/*
			// if player gets stunned, count towards 0
			if (player_properties.stunned) {
				if (gameProperties.current_time >= player_properties.free_time) {

					player_properties.stunned = false;
					//set the collision shield
				}
			}
			*/
			
			if (player_properties.player_health > 0 && !player_properties.stunned) {

				
				player_score.setText("Points: " + player_properties.player_score);
				
				
				if (player_properties.player_attack) {
					//set the sprite property of attack so that we can check if two sword collisions happen when two players attacks
					sword.attack = true; 
					if (game.time.totalElapsedSeconds() > player_properties.next_time) {
						dash_draw(); 
						player_properties.next_time = game.time.totalElapsedSeconds() + 0.05; 
					}
					
					// if the player got stunned, stop attacking 
					if (player_properties.stunned) {
						player_properties.player_attack = false;
						player_properties.in_cols_hit = []; 
						player_properties.in_cols_shieldhit = []; 
					}
					
					// if the player goes to destination, stop attacking, turn the pierce ability off
					if (is_inrange(player_properties.player_moveX, player.x, 10) && 
					is_inrange(player_properties.player_moveY, player.y, 10)) {
						player_properties.player_attack = false; 
						
						player_properties.pierce = false; 
						player_properties.destroy_sword(); 
						player_properties.draw_sword(player_properties.sword_width, player_properties.sword_height);
						
						//remove all the hit collision list and shield hit collision list of player; 
						player_properties.in_cols_hit = []; 
						player_properties.in_cols_shieldhit = []; 
					}
				} else {
					//set the sprite property of attack so that we can check if two sword collisions happen when two players attacks
					sword.attack = false; 
				}
				
				
				
			} 
			
			// emit the player input
			
			var pointer = game.input.mousePointer;
			
			socket.emit('input_fired', {
				gameWidth: gameProperties.gameWidth,
				gameHeight: gameProperties.gameHeight,
				speed: 300 * scale_ratio, 
				pointer_x: pointer.x / gameProperties.screenWidth, 
				pointer_y: pointer.y / gameProperties.screenHeight, 
				pointer_worldx: pointer.worldX / gameProperties.gameWidth, 
				pointer_worldy: pointer.worldY / gameProperties.gameHeight, 
				attacking: player_properties.player_attack,
				//stunned: player_properties.stunned,
				pierce: player_properties.pierce,
				x: player.x,
				y: player.y,
				sword_height: player_properties.sword_height/gameProperties.availMax
			});
			
			

			
			// update the items of players. make sure this is after moving.
			if (!player_properties.killed) {
				player_properties.player_update();
				
				
			
			}

			// kill the player when helath is 0 
			if (player_properties.player_health <= 0 && !player_properties.destroyed) {
				game.time.events.add(1000, function () {player_properties.player_destroy(1000);} , this); 
				player_properties.destroyed = true;
			}
			 
			 
			// update the score of the player; 
			if (player_properties.player_id) {
				socket.emit("new_score", {player_id: player_properties.player_id, score: player_properties.player_score,
				value: player_properties.player_value }); 
			}
			
			
		}
		
    },
	
		
	render: function () {
	
	}
	
};

var gameBootstrapper = {
    init: function(gameContainerElementId){
		game.state.add('main', mainState);
		game.state.add('login', login); 
		game.state.start('login'); 
    }
};;