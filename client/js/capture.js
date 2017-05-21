

var gamegraphicsassets = {
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
	crown_name: 'crown'
};

var game_config = {

}


var enemies = []; 
var speed_pickup = []; 
var stun_pickup = [];
var pierce_pickup = [];
 
 
var mainState = function(game){
	
};

function dash_attack () {
	if (player_properties.in_cols_shield.length >= 1 && !player_properties.pierce) {
		console.log(player_properties.in_cols_shield);
		var enemy_id = player_properties.in_cols_shield[0]; 

		socket.emit('player_stunned', {player_id: socket.id, enemy_id: enemy_id});
	}
	
	if (!player_properties.stunned) {
		player.rotation = movetoPointer(player, player_properties.dashspeed);
		if (player_properties.canattack == true) {
			player_properties.next_attack = player_properties.attack_cooldown + gameProperties.current_time; 
			player_properties.player_attack = true; 
		}
		player_properties.player_moveX = game.input.mousePointer.worldX;
		player_properties.player_moveY = game.input.mousePointer.worldY;
		
		
		
		// make sure the player items follow players * this line is for when the player first loads and spams click 
		player_properties.player_update();	
		
		for (var i = 0; i < player_properties.in_cols.length; i++) {
			if (!player_properties.stunned && player_properties.player_attack && player_properties.in_cols_shield < 1) {
				console.log('attack');
				//emit message of the position of the player 
				socket.emit('player_attack', {player_id: socket.id, enemy_id: player_properties.in_cols[i]});
			}
		}
		
		console.log(player_properties.in_cols_shield);
	}

}


function createDrawingArea() {
	//  Dimensions
	var spriteWidth = 16;
	var spriteHeight = 16;

	//  Drawing Area
	var canvas;
	var canvasBG;
	var canvasGrid;
	var canvasZoom = 128;

    game.create.grid('drawingGrid', 1920, 1920, 32, 32, 'rgba(0,191,243,0.8)');

    canvas = game.make.bitmapData(spriteWidth * canvasZoom, spriteHeight * canvasZoom);
    canvasBG = game.make.bitmapData(canvas.width, canvas.height);

    canvasBG.rect(0, 0, canvasBG.width, canvasBG.height, '#3f5c67');

    var x = 0;
    var y = 0;

    canvasBG.addToWorld(x, y);
    canvasGrid = game.add.sprite(x , y , 'drawingGrid');
    //canvasGrid.crop(new Phaser.Rectangle(0, 0, spriteWidth * canvasZoom, spriteHeight * canvasZoom));

}



// find the player in the enimes list of the id passed and change its position in the game 
function onMoveplayer (data) {
	
	if (gameProperties.in_game) {
		var movePlayer = findplayerbyid (data.id); 
		if (!movePlayer) {
			console.log('Player not found: ', data.id)
			return
		}
		//player
		movePlayer.player.body.x = data.x; 
		movePlayer.player.body.y = data.y; 
		movePlayer.player.body.angle = data.angle; 
		//sword
		movePlayer.sword.body.x = data.sword_x; 
		movePlayer.sword.body.y = data.sword_y; 
		movePlayer.sword.body.angle = data.sword_angle; 
		//shield
		movePlayer.shield.body.x = data.shield_x; 
		movePlayer.shield.body.y = data.shield_y; 
		movePlayer.shield.body.angle = data.shield_angle; 
		
		if (data.first_place) {
			movePlayer.first_place(); 
		} else if (movePlayer.first === true) {
			
			movePlayer.first = false; 
			movePlayer.crown.destroy(true, false); 
		}
		
		if (data.pierce) {
			movePlayer.pierce_effect(); 
		} else {
			movePlayer.pierce = false; 
			movePlayer.sword.loadTexture('sword');
		}
		
		movePlayer.updateremote();
		
		if (data.attacking) {
			console.log('hi'); 
			movePlayer.enemy_attack(); 
		} else {
			movePlayer.sword.attack = false; 
			return; 
		}
	}
}


function onitemUpdate (data) {
	var type = data.type;
	if (type === 'speed') {	
		speed_pickup.push(new speed_object(data.id, game, type, data.x, data.y)); 
	} else if (type === 'stun') {
		stun_pickup.push(new stun_object(data.id, game, type, data.x, data.y));
	} else if (type === 'pierce') {
		pierce_pickup.push(new pierce_object(data.id, game, type, data.x, data.y));
	}
	 
}


// call this function when first connected 
function onSocketConnected () {
	var username = game_config.username;
	var socketid = game_config.socketid; 
	var room_id = game_config.room_id; 
	
	socket.emit('new_player', {username: username, id: socketid, room_id: room_id, x: 0, y: 0, angle:player.angle});
}

function onSocketDisconnect () {
	console.log('Disconnected from socket server')
}


function onDamaged (data) {

	player_properties.player_health -= 10; 
	// when the player dies, kill him
	if (player_properties.player_health <= 0) {
		if (!player_properties.killed) {
			if (data.pierce) {
				player_properties.display_text('Enemy had Pierce'); 
			}
			player_properties.display_text('Killed by' + data.by_id, 1000); 
			
			socket.emit('killed', {id: socket.id, by_id:data.by_id, pierce: data.pierce}); 
			player_properties.killed = true; 
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

function onGained (data) {
	
	var value = data.value; 
	if (data.pierce) {
		player_properties.display_text('Slayed Enemy With Pierce!'); 
		value *= 1.5; 
	}

	var username = data.username; 
	
	this.onPlusClick(value);
	player_properties.player_score += value; 
	player_properties.display_text("You Killed " + username);
	
	//add kill streak
	player_properties.killstreak += 1; 
	
	// if the player killed a player in duration, add to streak; 	
	if (player_properties.streak_end >= gameProperties.current_time) {
		player_properties.display_text(player_properties.killstreak + " Kill Streak"); 
	} else if (player_properties.killstreak >= 2) {
		player_properties.killstreak = 0;
		console.log(player_properties.streak_end);
		console.log(player_properties.killstreak);
	}
	
	player_properties.streak_end = player_properties.streak_duration + gameProperties.current_time; 	
	
	
	// get rid of the in_cols list of the slain enemy id; 
	for (var i = 0; i < player_properties.in_cols.length; i++) {
		console.log(data.id); 
		
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
	console.log(data.type);
	
	if (data.type === 'speed') {
		console.log(data); 
		console.log(speed_pickup);
		var removeItem = finditembyid(data.id, speed_pickup.length, speed_pickup);
		console.log('hi');
	} else if (data.type === 'stun') {
		var removeItem = finditembyid(data.id, stun_pickup.length, stun_pickup );
	} else if (data.type === 'pierce') {
		var removeItem = finditembyid(data.id, pierce_pickup.length, pierce_pickup );
	} 
	 
	if (!removeItem) {
		console.log('Item not found: ', data.id)
		return;
	}
	removeItem.item.destroy(true,false);
	if (removeItem.type === 'speed') {
		speed_pickup.splice(speed_pickup.indexOf(removeItem), 1);
	}
}


function game_reset () {	
	game.stage.disableVisibilityChange = true;
	game.world.setBounds(0, 0, 1920, 1920, false, false, false, false);
	game.physics.startSystem(Phaser.Physics.P2JS);
	game.physics.p2.setBoundsToWorld(false, false, false, false, false)
	game.physics.p2.gravity.y = 0;
	game.physics.p2.applyGravity = false; 
	game.physics.p2.enableBody(game.physics.p2.walls, false); 
	// physics start system
	game.physics.p2.setImpactEvents(true);
		
	// empty the enemies, items 
	enemies = [];
	speed_pickup = []; 
	stun_pickup = [];
	pierce_pickup = [];
}


function onrestart () {
	
	game.time.events.add(Phaser.Timer.SECOND * 4, function () {gameProperties.in_game = false; 
	game.state.start('login', slideOut, slideIn, true, true);
	game.world.removeAll(); socket.disconnect(); } , this); 
}


mainState.prototype = {
	
    preload: function () {
		game.load.image(gamegraphicsassets.arrow_name, gamegraphicsassets.arrow_url); 
		game.load.image(gamegraphicsassets.sword_name, gamegraphicsassets.sword_url); 
		game.load.image(gamegraphicsassets.sword_piercename, gamegraphicsassets.sword_pierceurl); 
		game.load.image(gamegraphicsassets.shield_name, gamegraphicsassets.shield_url); 
		game.load.image(gamegraphicsassets.speedpickup_name, gamegraphicsassets.speedpickup_url); 
		game.load.image(gamegraphicsassets.stunpickup_name, gamegraphicsassets.stunpickup_url);
		game.load.image(gamegraphicsassets.piercepickup_name, gamegraphicsassets.piercepickup_url); 
		game.load.image(gamegraphicsassets.scoreboard_name, gamegraphicsassets.scorebord_url); 
		game.load.image(gamegraphicsassets.crown_name, gamegraphicsassets.crown_url); 
		game.load.spritesheet('button', 'client/assets/sprites/plus_minus.png', 31, 31);
    },
 
    create: function () {
		
		//resetting the game 
		game_reset();
		createDrawingArea();
		


		if (gameProperties.in_game) {
			// when the socket connects, call the onsocketconnected and send its information to the server 
			socket.emit('logged_in'); 
			
			socket.on('enter_game', onSocketConnected); 
			
			// when received remove_player, remove the player passed; 
			socket.on('remove_player', onRemovePlayer); 
			
			// check for item update
			socket.on('item_update', onitemUpdate); 
			
			// update items on the map; 
			
			// check if damaged 
			socket.on('damaged', onDamaged); 
			
			// check if stunned 
			socket.on('stunned', onStunned); 
			
			// check to gain points 
			socket.on ('gained_point', onGained.bind(this)); 
			
			// check for leaderboard
			socket.on ('leader_board', lbupdate); 
			
			// check for item removal
			socket.on ('itemremove', onitemremove); 
			
			// check for restart game 
			socket.on ('restart_game', onrestart); 
			
			 //listen for the broadcast.emit from the server for new player; 
			socket.on('new_player', function(info) {
				var check_duplicate = findplayerbyid(info.id);
				if (!check_duplicate) {
					var newPlayer = new remote_player(info.id, info.username, game, player, info.x, info.y, info.angle);
					enemies.push(newPlayer); 
				} else {
					return; 
				}
			
			}); 
			
			
			// listen if other players move 
			socket.on('move_player', onMoveplayer); 
		}
		

		player_properties = new set_player();
		player_properties.player_id = socket.id;		
		
		
		// setup player 
		player = game.add.sprite(0, 0, 'arrow');
		player.anchor.setTo(0.5, 0.5);
		player.scale.setTo(0.3, 0.3);
		game.physics.p2.enableBody(player, true); 
		player.name = player_properties.player_id; 
		
		// player body collisions 
		player.body.data.shapes[0].sensor = true;
		player.body.onBeginContact.add(player_coll, this); 
		
		
		sword = game.add.sprite(0, 0, 'sword');
		game.physics.p2.enableBody(sword, true);
		sword.body.data.gravityScale = 0;
		sword.scale.setTo(0.3,0.3);
		sword.pivot.y = - 150;
		sword.body.clearShapes();
		sword.body.addRectangle(200, 30, 50, 50);
		sword.body.angle = player.angle;
		// sword collisions 
		sword.body.data.shapes[0].sensor = true;
		sword.body.onBeginContact.add(collide_handle, this);	
		sword.body.onEndContact.add(collide_exit, this); 
		
		player_properties.items_p.push(sword); 
		
		
		shield = game.add.sprite(0, 0, 'shield');
		game.physics.p2.enableBody(shield, true);
		shield.body.data.gravityScale = 0;
		shield.scale.setTo(0.4,0.4);
		shield.pivot.y = 200;
		shield.body.clearShapes();
		shield.body.addRectangle(200, 100, 0, -80);
		shield.body.angle = player.angle; 
		shield.body.data.shapes[0].sensor = true;
		
		
		player_properties.items_p.push(shield); 

		gui_interface.bind(this)(); 
		
		//keycode; 
		attack_key = game.input.keyboard.addKey(Phaser.Keyboard.A);
		
		player_properties.player_update();
		game.input.onDown.add(dash_attack, this);
		
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
			
			
			if (player_properties.next_attack < gameProperties.current_time) {
				player_properties.canattack = true; 
			} else {
				player_properties.canattack = false;
			}
			
			
			// if player gets stunned, count towards 0
			if (player_properties.stunned) {
				if (gameProperties.current_time >= player_properties.free_time) {
					player_properties.stunned = false;
					//set the collision shield
				}
			}
			
			
			if (player_properties.player_health > 0 && !player_properties.stunned) {
				
				//if the player eats speed boost pick up draw the effect
				if (Math.abs(player.body.velocity.x) > 200 || Math.abs(player.body.velocity.y) > 200) {
					if (player_properties.speed_boost && !player_properties.player_attack) {
						dash_draw();
					}
				}

				
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
						sword.loadTexture('sword');
						
						//remove all the hit collision list and shield hit collision list of player; 
						player_properties.in_cols_hit = []; 
						player_properties.in_cols_shieldhit = []; 
					}
				} else {
					//set the sprite property of attack so that we can check if two sword collisions happen when two players attacks
					sword.attack = false; 
				}
				
				
				// character movement 
				if (!player_properties.player_attack) {
					if (distanceToPointer(player) <= 30) {
						player.rotation = movetoPointer(player, 0, game.input.activePointer, 1000);
					} else {
						player.rotation = movetoPointer(player, player_properties.speed , game.input.activePointer);
					}
				}
				
				
			} 
			
			
			// update the items of players. make sure this is after moving.
			if (!player_properties.killed) {
				player_properties.player_update();
				
					//emit message of the position of the player  
				var player_move = {
					x: player.x,
					y: player.y, 
					angle: player.angle, 
					
					sword_x: sword.x,
					sword_y: sword.y,
					sword_angle: sword.angle,
					
					shield_x: shield.x, 
					shield_y: shield.y, 
					shield_angle: shield.angle,
					
					attacking: player_properties.player_attack,
					pierce: player_properties.pierce
				}
				
				socket.emit('move_player', player_move);	
			}

			// kill the player when helath is 0 
			if (player_properties.player_health <= 0) {
				player.destroy(true, false); 
				player_properties.itemsdestroy(); 
			}
			 
			 
			// update the score of the player; 
			if (player_properties.player_id) {
				socket.emit("new_score", {player_id: player_properties.player_id, score: player_properties.player_score,
				value: player_properties.player_value }); 
			}
			
			
		}
		
    },
	
	onPlusClick: function(value){
		var new_exp = player_properties.expvalue + value; 
		player_properties.expvalue = new_exp;
	    var exp_max = player_properties.exp_max; 
		
		
		if (player_properties.expvalue >= player_properties.exp_max) {
			this.myHealthBar.setPercent(100); 
		    player_properties.expvalue = 0;		  
		    this.myHealthBar.setPercent(0);
		    player_properties.onLevelup();
		  
		    if (new_exp > exp_max) {
			    var new_val = new_exp - exp_max; 
			    this.onPlusClick(new_val); 
		    }
		    return; 
	    }
	  
	  var exp_percent = (player_properties.expvalue/player_properties.exp_max) * 100; 
      this.myHealthBar.setPercent(exp_percent);
	
    },
	
    onMinusClick: function(){
      player_properties.expvalue = player_properties.expvalue - 10;
      if(player_properties.expvalue < 0) player_properties.expvalue = 0;
      this.myHealthBar.setPercent(player_properties.expvalue);
    },
	
		
	render: function () {
	
		/*
		game.debug.body(player);
		for (var i = 0; i < enemies.length; i++) {
			game.debug.body(enemies[i].player);
		}*/
		
	}
	
};

var gameBootstrapper = {
    init: function(gameContainerElementId){
		game.state.add('main', mainState);
		game.state.add('login', login); 
		game.state.start('login'); 
    }
};;