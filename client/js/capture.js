var gameProperties = {
    screenWidth: 1340,
    screenHeight: 620,
};
var socket; 

var gamegraphicsassets = {
	arrow_url: 'client/assets/sprites/arrow.png',
	arrow_name: 'arrow',
	
	sword_url: 'client/assets/sprites/sword.png',
	sword_name: 'sword', 
	
	bullet: 'assets/sprites/bullet.png',
	bullet_name: 'bullet',
	
	ailen_url: 'assets/sprites/ailen.png',
	ailen_name: 'ailen',
	
};

var player_properties = {
	posX: 0,
	posY: 0,
	playerRot: 0, 
	player_health : 10
}

//  Dimensions
var spriteWidth = 16;
var spriteHeight = 16;

//  Drawing Area
var canvas;
var canvasBG;
var canvasGrid;
var canvasZoom = 128;
 
 
var ailens; 
var weapon; 

var enemies = []; 
		
 
var mainState = function(game){
	
};

function movetoPointer (displayObject, speed, pointer, maxTime) {
	
		var bound_limit = 40;
		var upper_bound = bound_limit;
		var bottom_bound = game.world.height - bound_limit;
		var left_bound = bound_limit;
		var right_bound = game.world.width - bound_limit; 
		var play_bound = true; 

		
        if (speed === undefined) { speed = 60; }
        pointer = pointer || this.game.input.activePointer;
        if (maxTime === undefined) { maxTime = 0; }

        var angle = angleToPointer(displayObject, pointer);

        if (maxTime > 0)
        {
            //  We know how many pixels we need to move, but how fast?
            speed = distanceToPointer(displayObject, pointer) / (maxTime / 1000);
        }
		
		if (displayObject.body.y < upper_bound || displayObject.body.y > bottom_bound) {
			if (!(game.input.worldY > upper_bound && game.input.worldY < bottom_bound)) {
				displayObject.body.velocity.y = 0;
			} else {
				displayObject.body.velocity.x = Math.cos(angle) * speed;
				displayObject.body.velocity.y = Math.sin(angle) * speed;
			}
		} else if (displayObject.body.x < left_bound || displayObject.body.x > right_bound) {
			if (!(game.input.worldX > left_bound && game.input.worldX < right_bound)) {
				displayObject.body.velocity.x = 0;
			} else {
				displayObject.body.velocity.x = Math.cos(angle) * speed;
				displayObject.body.velocity.y = Math.sin(angle) * speed;
			}
		}

		displayObject.body.velocity.x = Math.cos(angle) * speed;
		displayObject.body.velocity.y = Math.sin(angle) * speed;
        return angle;

}

function distanceToPointer (displayObject, pointer, world) {

        if (pointer === undefined) { pointer = game.input.activePointer; }
        if (world === undefined) { world = false; }

        var dx = (world) ? displayObject.world.x - pointer.worldX : displayObject.x - pointer.worldX;
        var dy = (world) ? displayObject.world.y - pointer.worldY : displayObject.y - pointer.worldY;

        return Math.sqrt(dx * dx + dy * dy);

}

function angleToPointer (displayObject, pointer, world) {

        if (pointer === undefined) { pointer = game.input.activePointer; }
        if (world === undefined) { world = false; }

        if (world)
        {
            return Math.atan2(pointer.worldY - displayObject.world.y, pointer.worldX - displayObject.world.x);
        }
        else
        {
            return Math.atan2(pointer.worldY - displayObject.y, pointer.worldX - displayObject.x);
        }

}



function createDrawingArea() {

    game.create.grid('drawingGrid', 16 * canvasZoom, 16 * canvasZoom, 32, 32, 'rgba(0,191,243,0.8)');

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
	var movePlayer = findplayerbyid (data.id); 
	if (!movePlayer) {
		console.log('Player not found: ', data.id)
		return
	}
	
	movePlayer.player.body.x = data.x; 
	movePlayer.player.body.y = data.y; 
	movePlayer.player.body.angle = data.angle; 
}

// call this function when first connected 
function onSocketConnected () {
	console.log('Connected to socket server');
	
	// Send local player data to the game server
	socket.emit('new_player', { x: 0, y: 0, angle:player.angle});
}

function onSocketDisconnect () {
	console.log('Disconnected from socket server')
}

// search through enemies list to find the right object of the id; 
function findplayerbyid (id) {
	for (var i = 0; i < enemies.length; i++) {
		if (enemies[i].player.name == id) {
			return enemies[i]; 
		}
	}
}

// find players to be removed 
function onRemovePlayer (data) {
  var removePlayer = findplayerbyid(data.id)

  console.log("removeworking");
  // Player not found
  if (!removePlayer) {
    console.log('Player not found: ', data.id)
    return;
  }

  removePlayer.player.kill(); 

  // Remove player from array
  enemies.splice(enemies.indexOf(removePlayer), 1);
}

var remote_player = function (index, game, player, startx, starty, startangle) {
	this.game = game; 
	this.player = player; 
	this.angle = startangle; 
	this.sword = new Phaser.Sprite(this.game, 50, 50, "sword");  
	this.swordname = "sword".concat(index.toString()); 
	this.sword.name = this.sword_name; 

	
	this.player = game.add.sprite(startx, starty, 'arrow');
	this.player.anchor.setTo(0.5, 0.5);
	this.player.scale.setTo(0.3, 0.3);
	this.player.name = index.toString(); 
	this.game.physics.p2.enableBody(this.player,true);
	this.player.body.data.shapes[0].sensor = true;
	
}

function onDamaged (data) {
	console.log('damaged'); 
	player_properties.player_health -= 10; 
}

function collide_handle (body, bodyB, shapeA, shapeB, equation) {
	if (body.sprite.key === 'arrow') {
		//emit message of the position of the player  
		socket.emit('player_attack', {player_id: socket.id, enemy_id: body.sprite.name}); 
	}	
}


mainState.prototype = {
	
    preload: function () {
		game.load.image(gamegraphicsassets.arrow_name, gamegraphicsassets.arrow_url); 
		game.load.image(gamegraphicsassets.sword_name, gamegraphicsassets.sword_url); 
    },
 
    create: function () {
		game.stage.disableVisibilityChange = true;
		game.world.setBounds(0, 0, 1920, 1920, false, false, false, false);
		game.physics.startSystem(Phaser.Physics.P2JS);
		game.physics.p2.setBoundsToWorld(false, false, false, false, false)
		game.physics.p2.gravity.y = 0;
		game.physics.p2.applyGravity = false; 
		game.physics.p2.enableBody(game.physics.p2.walls, false); 
		
		
		// physics start system
		game.physics.p2.setImpactEvents(true);
		
		
		socket = io.connect();
		
		// when the socket connects, call the onsocketconnected and send its information to the server 
		socket.on('connect', onSocketConnected); 
		
		// when received remove_player, remove the player passed; 
		socket.on('remove_player', onRemovePlayer); 
		
		// check if damaged 
		socket.on('damaged', onDamaged); 
		
		
		 //listen for the broadcast.emit from the server for new player; 
		socket.on('new_player', function(info) {
			enemies.push(new remote_player(info.id, game, player, info.x, info.y, info.angle)); 
			console.log(info); 
		}); 
		
		
		// listen if other players move 
		socket.on('move_player', onMoveplayer); 
		game.stage.backgroundColor = '#0072bc';
		createDrawingArea();
	
		
		player = game.add.sprite(200, 100, 'arrow');
		player.anchor.setTo(0.5, 0.5);
		player.scale.setTo(0.3, 0.3);
		
		sword = game.add.sprite(300, 200, 'sword');
		game.physics.p2.enableBody(sword, true);
		sword.body.data.gravityScale = 0;
		
		sword.body.data.shapes[0].sensor = true;
		
		game.physics.p2.enableBody(player, true); 
		player.body.data.shapes[0].sensor = true;
	

		player.body.onBeginContact.add(collide_handle, this); 

		
		// keep track of new players added; 
		socket.on('heartbeat', function (data) {
			
			/*for (var i in data) {
				if (data[i].id != socket.id) {
					var player_sprite = data[i].id;
					player_sprite.x = data[i].x; 
					player_sprite.y = data[i].y; 
				}
				
			}*/
			//console.log(player_lst); 
		}); 
		
		//camera follow
		game.camera.follow(player, Phaser.Camera.FOLLOW_LOCKON, 0.5, 0.5);
    },
 
    update: function () {

		if (distanceToPointer(player) <= 30) {
			player.rotation = movetoPointer(player, 0, game.input.activePointer, 1000);
		} else {
			player.rotation = movetoPointer(player, 400, game.input.activePointer);
		}
		
		
		
		//emit message of the position of the player  
		socket.emit('move_player', {x: player.x, y: player.y, angle: player.angle}); 
		

	


		sword.body.velocity.x = player.body.velocity.x;
		sword.body.velocity.y = player.body.velocity.y;
		
		console.log(player_properties.player_health); 
		
		// when the player dies, kill him
		if (player_properties.player_health <= 0) {
			console.log('killed'); 
			socket.emit('killed', {id: socket.id}); 
		}
		
    },
	
		
	render: function () {
	
		game.debug.body(player);
		for (var i = 0; i < enemies.length; i++) {
			game.debug.body(enemies[i].player);
		}
		
	}
	
};



 
var game = new Phaser.Game(gameProperties.screenWidth, gameProperties.screenHeight, Phaser.CANVAS, 'gameDiv');
game.state.add('main', mainState);
game.state.start('main');